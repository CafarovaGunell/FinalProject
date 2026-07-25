// Services/TestimonialService.cs
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
        var t = await _db.Testimonials.FirstOrDefaultAsync(x => x.Id == id);
        if (t is null) return ApiResponse<string>.Fail("Rəy tapılmadı.");

        if (!approve)
        {
            t.IsDeleted = true;
            await _db.SaveChangesAsync();
            await _notify.CreateAsync(t.AppUserId, "Rəy statusu", "Rəyiniz dərc olunmadı.", NotificationType.System);
            return ApiResponse<string>.Ok("ok", "Rəy rədd edildi.");
        }

        t.IsApproved = true;
        await _db.SaveChangesAsync();
        await _notify.CreateAsync(t.AppUserId, "Rəy statusu", "Rəyiniz dərc olundu. Təşəkkür edirik!",
            NotificationType.System, "/testimonials");

        return ApiResponse<string>.Ok("ok", "Rəy təsdiqləndi.");
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