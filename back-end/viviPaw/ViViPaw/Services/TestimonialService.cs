
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using ViViPaw.Data;
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.Testimonial;
using ViViPaw.Models.Common;
using ViViPaw.Models.Enums;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Services;

public class TestimonialService : ITestimonialService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;
    private readonly INotificationService _notify;

    public TestimonialService(AppDbContext db, IMapper mapper, INotificationService notify)
    {
        _db = db;
        _mapper = mapper;
        _notify = notify;
    }

    public async Task<ApiResponse<List<TestimonialGetDto>>> GetApprovedAsync(int? currentUserId)
    {
        var list = await _db.Testimonials
            .Where(x => x.IsApproved)
            .OrderByDescending(x => x.CreatedAt)
            .ProjectTo<TestimonialGetDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        if (currentUserId is > 0)
        {
            var likedIds = await _db.TestimonialLikes
                .Where(x => x.AppUserId == currentUserId)
                .Select(x => x.TestimonialId).ToListAsync();

            list.ForEach(t => t.IsLikedByCurrentUser = likedIds.Contains(t.Id));
        }

        return ApiResponse<List<TestimonialGetDto>>.Ok(list);
    }

    public async Task<ApiResponse<List<TestimonialGetDto>>> GetPendingAsync()
    {
        var list = await _db.Testimonials
            .Where(x => !x.IsApproved)
            .OrderBy(x => x.CreatedAt)
            .ProjectTo<TestimonialGetDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return ApiResponse<List<TestimonialGetDto>>.Ok(list);
    }

    public async Task<ApiResponse<List<TestimonialGetDto>>> GetMineAsync(int userId)
    {
        var list = await _db.Testimonials
            .Where(x => x.AppUserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ProjectTo<TestimonialGetDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return ApiResponse<List<TestimonialGetDto>>.Ok(list);
    }

    public async Task<ApiResponse<TestimonialGetDto>> CreateAsync(int userId, TestimonialCreateDto dto)
    {
        var recent = await _db.Testimonials
            .AnyAsync(x => x.AppUserId == userId && x.CreatedAt > DateTime.UtcNow.AddDays(-1));
        if (recent)
            return ApiResponse<TestimonialGetDto>.Fail("Gündə yalnız bir rəy yaza bilərsiniz.");

        var entity = _mapper.Map<Testimonial>(dto);
        entity.AppUserId = userId;
        entity.IsApproved = false;

        entity.ApprovalStatus = ApprovalStatus.Pending;
        entity.RejectReason = null;

        _db.Testimonials.Add(entity);
        await _db.SaveChangesAsync();

        var result = await _db.Testimonials.Where(x => x.Id == entity.Id)
            .ProjectTo<TestimonialGetDto>(_mapper.ConfigurationProvider).FirstAsync();

        return ApiResponse<TestimonialGetDto>.Ok(result, "Rəyiniz göndərildi. Admin təsdiqindən sonra dərc olunacaq.");
    }

    public async Task<ApiResponse<string>> ToggleLikeAsync(int userId, int testimonialId)
    {
        if (!await _db.Testimonials.AnyAsync(x => x.Id == testimonialId && x.IsApproved))
            return ApiResponse<string>.Fail("Rəy tapılmadı.");

        var like = await _db.TestimonialLikes
            .FirstOrDefaultAsync(x => x.AppUserId == userId && x.TestimonialId == testimonialId);

        if (like is not null)
        {
            _db.TestimonialLikes.Remove(like);
            await _db.SaveChangesAsync();
            return ApiResponse<string>.Ok("unliked", "Bəyənmə geri alındı.");
        }

        _db.TestimonialLikes.Add(new TestimonialLike { AppUserId = userId, TestimonialId = testimonialId });
        await _db.SaveChangesAsync();
        return ApiResponse<string>.Ok("liked", "Bəyənildi.");
    }

    public async Task<ApiResponse<string>> ApproveAsync(int id, bool approve)
    {
        var testimonial = await _db.Testimonials
            .FirstOrDefaultAsync(x => x.Id == id);

        if (testimonial is null)
            return ApiResponse<string>.Fail("Rəy tapılmadı.");

        if (approve)
        {
            testimonial.IsApproved = true;
            testimonial.ApprovalStatus = ApprovalStatus.Approved;
            testimonial.RejectReason = null;

            await _db.SaveChangesAsync();

            await _notify.CreateAsync(
                testimonial.AppUserId,
                "Rəy statusu",
                "Rəyiniz dərc olundu. Təşəkkür edirik!",
                NotificationType.System,
                "/testimonials"
            );

            return ApiResponse<string>.Ok(
                "ok",
                "Rəy təsdiqləndi."
            );
        }

        
        testimonial.IsApproved = false;
        testimonial.ApprovalStatus = ApprovalStatus.Rejected;
        testimonial.RejectReason = "Admin tərəfindən rədd edildi.";

        await _db.SaveChangesAsync();

        await _notify.CreateAsync(
            testimonial.AppUserId,
            "Rəy statusu",
            "Rəyiniz dərc olunmadı.",
            NotificationType.System
        );

        return ApiResponse<string>.Ok(
            "ok",
            "Rəy rədd edildi."
        );
    }



    public async Task<ApiResponse<List<TestimonialGetDto>>> GetAdminByStatusAsync(
    ApprovalStatus status
)
    {
        var query = _db.Testimonials
            .IgnoreQueryFilters()
            .Where(x => !x.IsDeleted)
            .AsQueryable();

        query = status switch
        {
            ApprovalStatus.Pending => query.Where(x =>
                x.ApprovalStatus == ApprovalStatus.Pending
            ),

            ApprovalStatus.Approved => query.Where(x =>
                x.ApprovalStatus == ApprovalStatus.Approved
            ),

            ApprovalStatus.Rejected => query.Where(x =>
                x.ApprovalStatus == ApprovalStatus.Rejected
            ),

            _ => query
        };

        var list = await query
            .OrderByDescending(x => x.CreatedAt)
            .ProjectTo<TestimonialGetDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return ApiResponse<List<TestimonialGetDto>>.Ok(list);
    }


    public async Task<ApiResponse<string>> AdminDeleteRejectedAsync(int id)
    {
        var testimonial = await _db.Testimonials
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (testimonial is null)
            return ApiResponse<string>.Fail("Rəy tapılmadı.");

        if (testimonial.ApprovalStatus != ApprovalStatus.Rejected)
        {
            return ApiResponse<string>.Fail(
                "Yalnız rədd edilmiş rəy silinə bilər."
            );
        }

        try
        {
            /*
              Soft delete: TestimonialLikes və digər FK məlumatları pozulmur.
            */
            testimonial.IsDeleted = true;

            var likes = await _db.TestimonialLikes
                .IgnoreQueryFilters()
                .Where(x => x.TestimonialId == testimonial.Id)
                .ToListAsync();

            foreach (var like in likes)
            {
                like.IsDeleted = true;
            }

            await _db.SaveChangesAsync();

            return ApiResponse<string>.Ok(
                "ok",
                "Rədd edilmiş rəy silindi."
            );
        }
        catch (Exception ex)
        {
            return ApiResponse<string>.Fail(
                $"Rəy silinə bilmədi: {ex.InnerException?.Message ?? ex.Message}"
            );
        }
    }

    public async Task<ApiResponse<string>> DeleteAsync(int userId, bool isAdmin, int id)
    {
        var t = await _db.Testimonials.FirstOrDefaultAsync(x => x.Id == id);
        if (t is null) return ApiResponse<string>.Fail("Rəy tapılmadı.");

        if (!isAdmin && t.AppUserId != userId)
            return ApiResponse<string>.Fail("İcazəniz yoxdur.");

        t.IsDeleted = true;
        await _db.SaveChangesAsync();
        return ApiResponse<string>.Ok("ok", "Rəy silindi.");
    }
}