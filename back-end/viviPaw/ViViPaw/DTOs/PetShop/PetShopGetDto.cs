
using ViViPaw.Models.Enums;

namespace ViViPaw.DTOs.PetShop;

public class PetShopGetDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string City { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public ApprovalStatus ApprovalStatus { get; set; }
    public string ApprovalStatusText { get; set; } = string.Empty;
    public int ProductCount { get; set; }
    public int PetCount { get; set; }
}