using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using ViViPaw.Data;
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.Notification;
using ViViPaw.Models.Common;
using ViViPaw.Models.Enums;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Services;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;          // ★ əlavə

    public NotificationService(AppDbContext db, IMapper mapper)   // ★ əlavə
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task CreateAsync(int userId, string title, string message,
                                  NotificationType type, string? redirectUrl = null)
    {
        _db.Notifications.Add(new Notification
        {
            AppUserId = userId,
            Title = title,
            Message = message,
            Type = type,
            RedirectUrl = redirectUrl
        });
        await _db.SaveChangesAsync();
    }

    public async Task<ApiResponse<List<NotificationGetDto>>> GetMyAsync(int userId, bool unreadOnly)
    {
        var q = _db.Notifications.Where(x => x.AppUserId == userId);
        if (unreadOnly) q = q.Where(x => !x.IsRead);

        var list = await q.OrderByDescending(x => x.CreatedAt).Take(100)
            .ProjectTo<NotificationGetDto>(_mapper.ConfigurationProvider).ToListAsync();

        return ApiResponse<List<NotificationGetDto>>.Ok(list);
    }

    public async Task<ApiResponse<int>> GetUnreadCountAsync(int userId)
    {
        var count = await _db.Notifications.CountAsync(x => x.AppUserId == userId && !x.IsRead);
        return ApiResponse<int>.Ok(count);
    }

    public async Task<ApiResponse<string>> MarkAsReadAsync(int userId, int id)
    {
        var n = await _db.Notifications.FirstOrDefaultAsync(x => x.Id == id && x.AppUserId == userId);
        if (n is null) return ApiResponse<string>.Fail("Bildiriş tapılmadı.");

        n.IsRead = true;
        await _db.SaveChangesAsync();
        return ApiResponse<string>.Ok("ok");
    }

    public async Task<ApiResponse<string>> MarkAllAsReadAsync(int userId)
    {
        var list = await _db.Notifications.Where(x => x.AppUserId == userId && !x.IsRead).ToListAsync();
        list.ForEach(x => x.IsRead = true);
        await _db.SaveChangesAsync();
        return ApiResponse<string>.Ok("ok", $"{list.Count} bildiriş oxundu.");
    }

    public async Task<ApiResponse<string>> DeleteAsync(int userId, int id)
    {
        var n = await _db.Notifications.FirstOrDefaultAsync(x => x.Id == id && x.AppUserId == userId);
        if (n is null) return ApiResponse<string>.Fail("Bildiriş tapılmadı.");

        _db.Notifications.Remove(n);
        await _db.SaveChangesAsync();
        return ApiResponse<string>.Ok("ok", "Silindi.");
    }
}