
using ViViPaw.Models.Adoption;
using ViViPaw.Models.Base;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Identity;

namespace ViViPaw.Models.Shop;

public class PetShop : BaseEntity
{
    public int AppUserId { get; set; }
    public AppUser AppUser { get; set; } = null!;

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

    public string TaxNumber { get; set; } = string.Empty;          // VÖEN
    public string? BusinessLicenseUrl { get; set; }

    // Admin təsdiqi
    public ApprovalStatus ApprovalStatus { get; set; } = ApprovalStatus.Pending;
    public string? RejectReason { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public int? ApprovedByUserId { get; set; }

    public ICollection<Pet> Pets { get; set; } = new List<Pet>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
}