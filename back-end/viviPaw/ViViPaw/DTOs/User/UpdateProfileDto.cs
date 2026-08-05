
using System.ComponentModel.DataAnnotations;

namespace ViViPaw.DTOs.User;

public class UpdateProfileDto
{
    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Phone]
    public string? PhoneNumber { get; set; }

    public string? City { get; set; }
    public string? ImageUrl { get; set; }

    public List<SocialMediaItemDto> SocialMediaLinks { get; set; } = new();
}

public class SocialMediaItemDto
{
    [Required]
    public string PlatformName { get; set; } = string.Empty;

    [Required]
    public string ProfileUrlOrUsername { get; set; } = string.Empty;
}