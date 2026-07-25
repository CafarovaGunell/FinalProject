// DTOs/PetShop/PetShopDetailDto.cs
using ViViPaw.Models.Enums;

namespace ViViPaw.DTOs.PetShop;

public class PetShopDetailDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Instagram { get; set; }
    public string? WebsiteUrl { get; set; }
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public ApprovalStatus ApprovalStatus { get; set; }
    public string ApprovalStatusText { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}