// Models/Common/SocialMediaLink.cs
using ViViPaw.Models.Base;
using ViViPaw.Models.Identity;

namespace ViViPaw.Models.Common;

public class SocialMediaLink : BaseEntity
{
    public int AppUserId { get; set; }
    public AppUser AppUser { get; set; } = null!;

    public string PlatformName { get; set; } = string.Empty;
    public string ProfileUrlOrUsername { get; set; } = string.Empty;
}