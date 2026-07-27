// Services/ProductService.cs
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using ViViPaw.Data;
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.Product;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Shop;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;

    public ProductService(AppDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<ApiResponse<PagedResult<ProductGetDto>>> GetAllAsync(ProductFilterDto f)
    {
        var q = _db.Products
            .Include(x => x.Images)
            .Include(x => x.Reviews)
            .Where(x => x.IsActive && x.PetShop.ApprovalStatus == ApprovalStatus.Approved)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(f.Search))
        {
            var s = f.Search.Trim().ToLower();
            q = q.Where(x => x.Name.ToLower().Contains(s)
                          || x.Description.ToLower().Contains(s)
                          || (x.Brand != null && x.Brand.ToLower().Contains(s)));
        }

        if (f.CategoryId.HasValue) q = q.Where(x => x.CategoryId == f.CategoryId);
        if (f.TargetAnimalCategoryId.HasValue) q = q.Where(x => x.TargetAnimalCategoryId == f.TargetAnimalCategoryId);
        if (f.PetShopId.HasValue) q = q.Where(x => x.PetShopId == f.PetShopId);
        if (f.MinPrice.HasValue) q = q.Where(x => (x.DiscountPrice ?? x.Price) >= f.MinPrice);
        if (f.MaxPrice.HasValue) q = q.Where(x => (x.DiscountPrice ?? x.Price) <= f.MaxPrice);
        if (f.InStockOnly == true) q = q.Where(x => x.StockQuantity > 0);

        q = f.SortBy switch
        {
            "price_asc" => q.OrderBy(x => x.DiscountPrice ?? x.Price),
            "price_desc" => q.OrderByDescending(x => x.DiscountPrice ?? x.Price),
            "rating" => q.OrderByDescending(x => x.Reviews.Any() ? x.Reviews.Average(r => r.Rating) : 0),
            _ => q.OrderByDescending(x => x.CreatedAt)
        };

        var total = await q.CountAsync();
        var page = f.Page < 1 ? 1 : f.Page;
        var size = f.PageSize is < 1 or > 60 ? 12 : f.PageSize;

        var items = await q.Skip((page - 1) * size).Take(size)
            .ProjectTo<ProductGetDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return ApiResponse<PagedResult<ProductGetDto>>.Ok(new PagedResult<ProductGetDto>
        {
            Items = items,
            Page = page,
            PageSize = size,
            TotalCount = total
        });
    }

    public async Task<ApiResponse<ProductDetailDto>> GetByIdAsync(int id)
    {
        var dto = await _db.Products.Where(x => x.Id == id)
            .ProjectTo<ProductDetailDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        return dto is null
            ? ApiResponse<ProductDetailDto>.Fail("Məhsul tapılmadı.")
            : ApiResponse<ProductDetailDto>.Ok(dto);
    }

    public async Task<ApiResponse<List<ProductGetDto>>> GetMyProductsAsync(int userId)
    {
        var shopId = await _db.PetShops.Where(x => x.AppUserId == userId)
            .Select(x => (int?)x.Id).FirstOrDefaultAsync();

        if (shopId is null)
            return ApiResponse<List<ProductGetDto>>.Fail("Mağaza profiliniz yoxdur.");

        var list = await _db.Products.Where(x => x.PetShopId == shopId)
            .OrderByDescending(x => x.CreatedAt)
            .ProjectTo<ProductGetDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return ApiResponse<List<ProductGetDto>>.Ok(list);
    }

    public async Task<ApiResponse<ProductDetailDto>> CreateAsync(int userId, ProductCreateDto dto)
    {
        var shop = await _db.PetShops.FirstOrDefaultAsync(x => x.AppUserId == userId);
        if (shop is null) return ApiResponse<ProductDetailDto>.Fail("Mağaza profiliniz yoxdur.");
        if (shop.ApprovalStatus != ApprovalStatus.Approved)
            return ApiResponse<ProductDetailDto>.Fail("Mağazanız hələ təsdiqlənməyib.");

        if (!await _db.Categories.AnyAsync(x => x.Id == dto.CategoryId && x.Type == CategoryType.Product))
            return ApiResponse<ProductDetailDto>.Fail("Yanlış məhsul kateqoriyası.");

        if (dto.DiscountPrice.HasValue && dto.DiscountPrice >= dto.Price)
            return ApiResponse<ProductDetailDto>.Fail("Endirimli qiymət əsas qiymətdən kiçik olmalıdır.");

        var product = _mapper.Map<Product>(dto);
        product.PetShopId = shop.Id;
        product.IsActive = true;

        for (int i = 0; i < dto.ImageUrls.Count; i++)
            product.Images.Add(new ProductImage { ImageUrl = dto.ImageUrls[i], IsMain = i == 0 });

        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        var result = await _db.Products.Where(x => x.Id == product.Id)
            .ProjectTo<ProductDetailDto>(_mapper.ConfigurationProvider).FirstAsync();

        return ApiResponse<ProductDetailDto>.Ok(result, "Məhsul əlavə edildi.");
    }

    public async Task<ApiResponse<ProductDetailDto>> UpdateAsync(int userId, bool isAdmin, int id, ProductUpdateDto dto)
    {
        var product = await _db.Products.Include(x => x.Images).FirstOrDefaultAsync(x => x.Id == id);
        if (product is null) return ApiResponse<ProductDetailDto>.Fail("Məhsul tapılmadı.");

        if (!isAdmin && !await _db.PetShops.AnyAsync(x => x.Id == product.PetShopId && x.AppUserId == userId))
            return ApiResponse<ProductDetailDto>.Fail("İcazəniz yoxdur.");

        if (dto.DiscountPrice.HasValue && dto.DiscountPrice >= dto.Price)
            return ApiResponse<ProductDetailDto>.Fail("Endirimli qiymət əsas qiymətdən kiçik olmalıdır.");

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.DiscountPrice = dto.DiscountPrice;
        product.StockQuantity = dto.StockQuantity;
        product.Brand = dto.Brand;
        product.IsActive = dto.IsActive;
        product.CategoryId = dto.CategoryId;
        product.TargetAnimalCategoryId = dto.TargetAnimalCategoryId;

        if (dto.ImageUrls is not null && dto.ImageUrls.Any())
        {
            _db.ProductImages.RemoveRange(product.Images);
            for (int i = 0; i < dto.ImageUrls.Count; i++)
                product.Images.Add(new ProductImage { ProductId = product.Id, ImageUrl = dto.ImageUrls[i], IsMain = i == 0 });
        }

        await _db.SaveChangesAsync();

        var result = await _db.Products.Where(x => x.Id == id)
            .ProjectTo<ProductDetailDto>(_mapper.ConfigurationProvider).FirstAsync();

        return ApiResponse<ProductDetailDto>.Ok(result, "Məhsul yeniləndi.");
    }

    public async Task<ApiResponse<string>> DeleteAsync(int userId, bool isAdmin, int id)
    {
        var product = await _db.Products.FirstOrDefaultAsync(x => x.Id == id);
        if (product is null) return ApiResponse<string>.Fail("Məhsul tapılmadı.");

        if (!isAdmin && !await _db.PetShops.AnyAsync(x => x.Id == product.PetShopId && x.AppUserId == userId))
            return ApiResponse<string>.Fail("İcazəniz yoxdur.");

        product.IsDeleted = true;
        product.IsActive = false;
        await _db.SaveChangesAsync();

        return ApiResponse<string>.Ok("ok", "Məhsul silindi.");
    }
}



