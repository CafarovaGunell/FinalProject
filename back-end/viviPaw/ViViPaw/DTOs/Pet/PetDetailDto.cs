// DTOs/Pet/PetDetailDto.cs
using ViViPaw.Models.Enums;

namespace ViViPaw.DTOs.Pet;

public class PetDetailDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Breed { get; set; } = string.Empty;
    public Gender Gender { get; set; }
    public string GenderText { get; set; } = string.Empty;
    public int AgeInMonths { get; set; }
    public string AgeText { get; set; } = string.Empty;
    public PetSize Size { get; set; }
    public string SizeText { get; set; } = string.Empty;
    public string? Color { get; set; }
    public string Description { get; set; } = string.Empty;

    public bool IsVaccinated { get; set; }
    public bool IsNeutered { get; set; }
    public string? HealthNotes { get; set; }

    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string ContactPhone { get; set; } = string.Empty;
    public string? ReasonToGiveAway { get; set; }

    public AdoptionStatus AdoptionStatus { get; set; }
    public string AdoptionStatusText { get; set; } = string.Empty;
    public PetOwnerType OwnerType { get; set; }
    public bool IsUrgent { get; set; }
    public bool IsApproved { get; set; }

    public List<string> ImageUrls { get; set; } = new();
    public string DateText { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // Sahib məlumatı
    public int? PetShopId { get; set; }
    public string? PetShopName { get; set; }
    public string? PetShopLogo { get; set; }
    public string? PetShopPhone { get; set; }
    public string? PetShopEmail { get; set; }
    public string? PetShopInstagram { get; set; }
    public string? PetShopAddress { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public int? OwnerUserId { get; set; }
    public string? OwnerFullName { get; set; }
}