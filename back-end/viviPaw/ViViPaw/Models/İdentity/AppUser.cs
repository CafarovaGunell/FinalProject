// Models/Identity/AppUser.cs
using Microsoft.AspNetCore.Identity;
using ViViPaw.Models.Common;

namespace ViViPaw.Models.Identity;

public class AppUser : IdentityUser<int>
{
    // Email, PhoneNumber, PasswordHash, UserName → IdentityUser-dən gəlir
    public string FullName { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? City { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<SocialMediaLink> SocialMediaLinks { get; set; } = new List<SocialMediaLink>();
}