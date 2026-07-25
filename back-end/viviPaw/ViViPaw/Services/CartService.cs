
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ViViPaw.Data;
using ViViPaw.DTOs.Cart;
using ViViPaw.DTOs.Common;
using ViViPaw.Models.Shop;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Services;

public class CartService : ICartService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;

    public CartService(AppDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    private async Task<Cart> GetOrCreateCartAsync(int userId)
    {
        var cart = await _db.Carts
            .Include(c => c.Items).ThenInclude(i => i.Product).ThenInclude(p => p.Images)
            .Include(c => c.Items).ThenInclude(i => i.Product).ThenInclude(p => p.PetShop)
            .FirstOrDefaultAsync(c => c.AppUserId == userId);

        if (cart is null)
        {
            cart = new Cart { AppUserId = userId };
            _db.Carts.Add(cart);
            await _db.SaveChangesAsync();
        }
        return cart;
    }

    public async Task<ApiResponse<CartDto>> GetMyCartAsync(int userId)
        => ApiResponse<CartDto>.Ok(_mapper.Map<CartDto>(await GetOrCreateCartAsync(userId)));

    public async Task<ApiResponse<CartDto>> AddAsync(int userId, AddToCartDto dto)
    {
        var product = await _db.Products.FirstOrDefaultAsync(x => x.Id == dto.ProductId && x.IsActive);
        if (product is null) return ApiResponse<CartDto>.Fail("Məhsul tapılmadı.");

        var cart = await GetOrCreateCartAsync(userId);
        var item = cart.Items.FirstOrDefault(i => i.ProductId == dto.ProductId);
        var newQty = (item?.Quantity ?? 0) + dto.Quantity;

        if (newQty > product.StockQuantity)
            return ApiResponse<CartDto>.Fail($"Anbarda yalnız {product.StockQuantity} ədəd var.");

        if (item is null)
            _db.CartItems.Add(new CartItem { CartId = cart.Id, ProductId = dto.ProductId, Quantity = dto.Quantity });
        else
            item.Quantity = newQty;

        await _db.SaveChangesAsync();
        return ApiResponse<CartDto>.Ok(_mapper.Map<CartDto>(await GetOrCreateCartAsync(userId)), "Səbətə əlavə edildi.");
    }

    public async Task<ApiResponse<CartDto>> UpdateItemAsync(int userId, int itemId, UpdateCartItemDto dto)
    {
        var item = await _db.CartItems.Include(i => i.Cart).Include(i => i.Product)
            .FirstOrDefaultAsync(i => i.Id == itemId && i.Cart.AppUserId == userId);

        if (item is null) return ApiResponse<CartDto>.Fail("Səbət elementi tapılmadı.");
        if (dto.Quantity > item.Product.StockQuantity)
            return ApiResponse<CartDto>.Fail($"Anbarda yalnız {item.Product.StockQuantity} ədəd var.");

        item.Quantity = dto.Quantity;
        await _db.SaveChangesAsync();

        return ApiResponse<CartDto>.Ok(_mapper.Map<CartDto>(await GetOrCreateCartAsync(userId)), "Yeniləndi.");
    }

    public async Task<ApiResponse<CartDto>> RemoveItemAsync(int userId, int itemId)
    {
        var item = await _db.CartItems.Include(i => i.Cart)
            .FirstOrDefaultAsync(i => i.Id == itemId && i.Cart.AppUserId == userId);

        if (item is null) return ApiResponse<CartDto>.Fail("Səbət elementi tapılmadı.");

        _db.CartItems.Remove(item);
        await _db.SaveChangesAsync();

        return ApiResponse<CartDto>.Ok(_mapper.Map<CartDto>(await GetOrCreateCartAsync(userId)), "Silindi.");
    }

    public async Task<ApiResponse<string>> ClearAsync(int userId)
    {
        var cart = await _db.Carts.Include(c => c.Items).FirstOrDefaultAsync(c => c.AppUserId == userId);
        if (cart is not null)
        {
            _db.CartItems.RemoveRange(cart.Items);
            await _db.SaveChangesAsync();
        }
        return ApiResponse<string>.Ok("ok", "Səbət boşaldıldı.");
    }
}