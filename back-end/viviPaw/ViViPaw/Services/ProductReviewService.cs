
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

public class ProductReviewService : IProductReviewService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;

    public ProductReviewService(AppDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<ApiResponse<List<ProductReviewGetDto>>> GetByProductAsync(int productId)
    {
        var list = await _db.ProductReviews
            .Where(x => x.ProductId == productId && x.IsApproved)
            .OrderByDescending(x => x.CreatedAt)
            .ProjectTo<ProductReviewGetDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return ApiResponse<List<ProductReviewGetDto>>.Ok(list);
    }

    public async Task<ApiResponse<ProductReviewGetDto>> CreateAsync(int userId, ProductReviewCreateDto dto)
    {
        if (!await _db.Products.AnyAsync(x => x.Id == dto.ProductId))
            return ApiResponse<ProductReviewGetDto>.Fail("Məhsul tapılmadı.");

        if (await _db.ProductReviews.AnyAsync(x => x.ProductId == dto.ProductId && x.AppUserId == userId))
            return ApiResponse<ProductReviewGetDto>.Fail("Bu məhsula artıq rəy yazmısınız.");

        // Yalnız alanlar rəy yaza bilər
        var hasBought = await _db.OrderItems
            .AnyAsync(oi => oi.ProductId == dto.ProductId
                         && oi.Order.CustomerUserId == userId
                         && oi.Order.Status == OrderStatus.Delivered);

        if (!hasBought)
            return ApiResponse<ProductReviewGetDto>.Fail("Yalnız aldığınız məhsula rəy yaza bilərsiniz.");

        var entity = new ProductReview
        {
            ProductId = dto.ProductId,
            AppUserId = userId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            IsApproved = true
        };

        _db.ProductReviews.Add(entity);
        await _db.SaveChangesAsync();

        var result = await _db.ProductReviews.Where(x => x.Id == entity.Id)
            .ProjectTo<ProductReviewGetDto>(_mapper.ConfigurationProvider).FirstAsync();

        return ApiResponse<ProductReviewGetDto>.Ok(result, "Rəyiniz əlavə edildi.");
    }

    public async Task<ApiResponse<string>> DeleteAsync(int userId, bool isAdmin, int id)
    {
        var entity = await _db.ProductReviews.FirstOrDefaultAsync(x => x.Id == id);
        if (entity is null) return ApiResponse<string>.Fail("Rəy tapılmadı.");

        if (!isAdmin && entity.AppUserId != userId)
            return ApiResponse<string>.Fail("İcazəniz yoxdur.");

        entity.IsDeleted = true;
        await _db.SaveChangesAsync();

        return ApiResponse<string>.Ok("ok", "Rəy silindi.");
    }
}