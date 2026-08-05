
using ViViPaw.Models.Base;
using ViViPaw.Models.Common;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Identity;
using ViViPaw.Models.Shop;

namespace ViViPaw.Models.Adoption;

public class Pet : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Breed { get; set; } = string.Empty;
    public Gender Gender { get; set; }
    public int AgeInMonths { get; set; }
    public PetSize Size { get; set; } = PetSize.Medium;
    public string? Color { get; set; }
    public string Description { get; set; } = string.Empty;

    //Sağlamlıq 
    public bool IsVaccinated { get; set; }
    public bool IsNeutered { get; set; }
    public string? HealthNotes { get; set; }

    // Kateqoriya (İt, Pişik, Quş) 
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    //  Kim yerləşdirib? İKİSİNDƏN BİRİ dolu olur 
    public PetOwnerType OwnerType { get; set; }
    public int? PetShopId { get; set; }
    public PetShop? PetShop { get; set; }
    public int? AppUserId { get; set; }
    public AppUser? AppUser { get; set; }

    //Əlaqə / yer
    public string City { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string ContactPhone { get; set; } = string.Empty;

    //Yalnız istifadəçi elanları üçün: niyə sahibləndirir
    public string? ReasonToGiveAway { get; set; }

    //Status & moderasiya 
    public AdoptionStatus AdoptionStatus { get; set; } = AdoptionStatus.Available;
    public bool IsApproved { get; set; } = false;   // Admin moderasiyası (shop üçün auto true)
    public bool IsUrgent { get; set; } = false;     // artıq hesablanmır — əl ilə təyin olunur

    public ICollection<PetImage> Images { get; set; } = new List<PetImage>();
    public ICollection<AdoptionRequest> AdoptionRequests { get; set; } = new List<AdoptionRequest>();
    public ICollection<WishList> WishLists { get; set; } = new List<WishList>();
}