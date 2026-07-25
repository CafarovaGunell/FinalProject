// DTOs/Pet/PetCreateDto.cs
using System.ComponentModel.DataAnnotations;
using ViViPaw.Models.Enums;

namespace ViViPaw.DTOs.Pet;

public class PetCreateDto
{
    [Required, MaxLength(80)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(80)]
    public string Breed { get; set; } = string.Empty;

    [Required]
    public Gender Gender { get; set; }

    [Range(0, 360)]
    public int AgeInMonths { get; set; }

    public PetSize Size { get; set; } = PetSize.Medium;
    public string? Color { get; set; }

    [Required, MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    public bool IsVaccinated { get; set; }
    public bool IsNeutered { get; set; }
    public string? HealthNotes { get; set; }

    [Required]
    public int CategoryId { get; set; }

    [Required, MaxLength(80)]
    public string City { get; set; } = string.Empty;

    public string? Address { get; set; }

    [Required, Phone]
    public string ContactPhone { get; set; } = string.Empty;

    /// <summary>Yalnız Customer elanı üçün</summary>
    public string? ReasonToGiveAway { get; set; }

    public bool IsUrgent { get; set; } = false;

    /// <summary>Şəkil URL-ləri (əvvəl upload olunub, URL gəlir)</summary>
    public List<string> ImageUrls { get; set; } = new();
}