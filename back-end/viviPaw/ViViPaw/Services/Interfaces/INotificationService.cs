
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.Notification;
using ViViPaw.Models.Enums;

namespace ViViPaw.Services.Interfaces;

public interface INotificationService
{
    Task CreateAsync(int userId, string title, string message,
                     NotificationType type, string? redirectUrl = null);


    Task<ApiResponse<List<NotificationGetDto>>> GetMyAsync(int userId, bool unreadOnly);
    Task<ApiResponse<int>> GetUnreadCountAsync(int userId);
    Task<ApiResponse<string>> MarkAsReadAsync(int userId, int id);
    Task<ApiResponse<string>> MarkAllAsReadAsync(int userId);
    Task<ApiResponse<string>> DeleteAsync(int userId, int id);
}