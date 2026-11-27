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

    public ProductReviewService(
        AppDbContext db,
        IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    /*
      Məhsul səhifəsində yalnız:
      - adminin təsdiqlədiyi;
      - silinməmiş rəylər görünəcək.
    */
    public async Task<ApiResponse<List<ProductReviewGetDto>>> GetByProductAsync(
        int productId)
    {
        var list = await _db.ProductReviews
            .AsNoTracking()
            .Where(x =>
                x.ProductId == productId &&
                x.IsApproved &&
                !x.IsDeleted)
            .OrderByDescending(x => x.CreatedAt)
            .ProjectTo<ProductReviewGetDto>(
                _mapper.ConfigurationProvider)
            .ToListAsync();

        return ApiResponse<List<ProductReviewGetDto>>.Ok(list);
    }

    /*
      Hər daxil olmuş istifadəçi:
      - məhsulu almasa belə;
      - eyni məhsula istədiyi qədər;
      rəy yaza bilər.
    */
    public async Task<ApiResponse<ProductReviewGetDto>> CreateAsync(
        int userId,
        ProductReviewCreateDto dto)
    {
        try
        {
            if (dto is null)
            {
                return ApiResponse<ProductReviewGetDto>.Fail(
                    "Rəy məlumatları boş ola bilməz."
                );
            }

            if (dto.ProductId <= 0)
            {
                return ApiResponse<ProductReviewGetDto>.Fail(
                    "Məhsul ID-si düzgün deyil."
                );
            }

            if (dto.Rating < 1 || dto.Rating > 5)
            {
                return ApiResponse<ProductReviewGetDto>.Fail(
                    "Qiymətləndirmə 1 ilə 5 arasında olmalıdır."
                );
            }

            if (string.IsNullOrWhiteSpace(dto.Comment))
            {
                return ApiResponse<ProductReviewGetDto>.Fail(
                    "Rəy mətni boş ola bilməz."
                );
            }

            var productExists = await _db.Products
                .AnyAsync(x => x.Id == dto.ProductId);

            if (!productExists)
            {
                return ApiResponse<ProductReviewGetDto>.Fail(
                    "Məhsul tapılmadı."
                );
            }

            /*
              Burada:
              - "bu məhsula artıq rəy yazmısınız" yoxlaması YOXDUR;
              - məhsulu alıb-almaması yoxlanmır;
              - rəy pending olaraq yaradılır.
            */
            var entity = new ProductReview
            {
                ProductId = dto.ProductId,
                AppUserId = userId,
                Rating = dto.Rating,
                Comment = dto.Comment.Trim(),

                IsApproved = false,
                ApprovalStatus = ApprovalStatus.Pending
            };

            _db.ProductReviews.Add(entity);
            await _db.SaveChangesAsync();

            var result = _mapper.Map<ProductReviewGetDto>(entity);

            return ApiResponse<ProductReviewGetDto>.Ok(
                result,
                "Rəyiniz göndərildi. Admin təsdiqindən sonra dərc olunacaq."
            );
        }
        catch (Exception ex)
        {
            var error = ex.InnerException?.Message ?? ex.Message;

            return ApiResponse<ProductReviewGetDto>.Fail(
                $"Rəy əlavə edilə bilmədi: {error}"
            );
        }
    }

    /*
      User yalnız öz rəyini edit edə bilər.
      Edit edilən rəy yenidən admin təsdiqinə düşür.
    */
    public async Task<ApiResponse<ProductReviewGetDto>> UpdateAsync(
      int userId,
      int id,
      ProductReviewCreateDto dto)
    {
        if (dto is null)
            return ApiResponse<ProductReviewGetDto>.Fail(
                "Rəy məlumatları boş ola bilməz."
            );

        if (dto.Rating < 1 || dto.Rating > 5)
            return ApiResponse<ProductReviewGetDto>.Fail(
                "Qiymətləndirmə 1 ilə 5 arasında olmalıdır."
            );

        if (string.IsNullOrWhiteSpace(dto.Comment))
            return ApiResponse<ProductReviewGetDto>.Fail(
                "Rəy mətni boş ola bilməz."
            );

        var review = await _db.ProductReviews
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

        if (review is null)
            return ApiResponse<ProductReviewGetDto>.Fail("Rəy tapılmadı.");

        if (review.AppUserId != userId)
            return ApiResponse<ProductReviewGetDto>.Fail(
                "Bu rəyi redaktə etmək icazəniz yoxdur."
            );

        review.Rating = dto.Rating;
        review.Comment = dto.Comment.Trim();

        // Yenidən moderator təsdiqinə düşür
        review.IsApproved = false;
        review.ApprovalStatus = ApprovalStatus.Pending;


        await _db.SaveChangesAsync();

        var result = _mapper.Map<ProductReviewGetDto>(review);

        return ApiResponse<ProductReviewGetDto>.Ok(
            result,
            "Rəy yeniləndi və yenidən admin təsdiqinə göndərildi."
        );
    }
    /*
      Admin panel üçün:
      status = pending
      status = approved
    */
    public async Task<ApiResponse<List<ProductReviewGetDto>>> GetAdminAsync(
        ApprovalStatus status)
    {
        var query = _db.ProductReviews
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(x => !x.IsDeleted)
            .AsQueryable();

        query = status switch
        {
            ApprovalStatus.Pending => query.Where(x =>
                x.ApprovalStatus == ApprovalStatus.Pending),

            ApprovalStatus.Approved => query.Where(x =>
                x.ApprovalStatus == ApprovalStatus.Approved),

            ApprovalStatus.Rejected => query.Where(x =>
                x.ApprovalStatus == ApprovalStatus.Rejected),

            _ => query
        };

        var list = await query
            .OrderByDescending(x => x.CreatedAt)
            .ProjectTo<ProductReviewGetDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return ApiResponse<List<ProductReviewGetDto>>.Ok(list);
    }

    /*
      Admin rəyə approve verir.
      Bu zaman rəy məhsul səhifəsində görünəcək.
    */
    public async Task<ApiResponse<string>> ApproveAsync(int id)
    {
        var review = await _db.ProductReviews
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

        if (review is null)
            return ApiResponse<string>.Fail("Rəy tapılmadı.");

        review.IsApproved = true;
        review.ApprovalStatus = ApprovalStatus.Approved;

        await _db.SaveChangesAsync();

        return ApiResponse<string>.Ok(
            "ok",
            "Rəy təsdiqləndi və dərc edildi."
        );
    }

    /*
      Modeldə Rejected statusu olmadığı üçün:
      rədd edilmiş rəy soft-delete edilir.
    */
    public async Task<ApiResponse<string>> RejectAsync(int id)
    {
        var review = await _db.ProductReviews
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

        if (review is null)
            return ApiResponse<string>.Fail("Rəy tapılmadı.");

        review.IsApproved = false;
        review.ApprovalStatus = ApprovalStatus.Rejected;

        await _db.SaveChangesAsync();

        return ApiResponse<string>.Ok(
            "ok",
            "Rəy rədd edildi."
        );
    }

    /*
      Admin bütün rəyləri silə bilər.
      User isə yalnız öz rəyini silə bilər.
    */
    public async Task<ApiResponse<string>> DeleteAsync(
        int userId,
        bool isAdmin,
        int id)
    {
        var entity = await _db.ProductReviews
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                !x.IsDeleted);

        if (entity is null)
        {
            return ApiResponse<string>.Fail(
                "Rəy tapılmadı."
            );
        }

        if (!isAdmin && entity.AppUserId != userId)
        {
            return ApiResponse<string>.Fail(
                "İcazəniz yoxdur."
            );
        }

        entity.IsDeleted = true;

        await _db.SaveChangesAsync();

        return ApiResponse<string>.Ok(
            "ok",
            "Rəy silindi."
        );



    }



   



}