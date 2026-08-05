
using System.ComponentModel.DataAnnotations;

namespace ViViPaw.DTOs.PetShop;

public class PetShopCreateDto
{
    [Required, MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    public string? LogoUrl { get; set; }

    [Required, Phone]
    public string Phone { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    public string? Instagram { get; set; }
    public string? WebsiteUrl { get; set; }

    [Required]
    public string Address { get; set; } = string.Empty;

    [Required]
    public string City { get; set; } = string.Empty;

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    [Required]
    public string TaxNumber { get; set; } = string.Empty;

    public string? BusinessLicenseUrl { get; set; }
}