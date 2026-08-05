
using ViViPaw.Models.Base;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Identity;

namespace ViViPaw.Models.Common;

public class Notification : BaseEntity
{
    public int AppUserId { get; set; }
    public AppUser AppUser { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public string? RedirectUrl { get; set; }   //pets/12  → frontend yönləndirmə
    public bool IsRead { get; set; } = false;
}