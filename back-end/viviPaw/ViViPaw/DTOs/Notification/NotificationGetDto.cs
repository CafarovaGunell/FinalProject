
using ViViPaw.Models.Enums;

namespace ViViPaw.DTOs.Notification;

public class NotificationGetDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public string? RedirectUrl { get; set; }
    public bool IsRead { get; set; }
    public string DateText { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}