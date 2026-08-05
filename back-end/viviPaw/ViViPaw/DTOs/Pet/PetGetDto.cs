
using ViViPaw.Models.Enums;

namespace ViViPaw.DTOs.Pet;


public class PetGetDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Breed { get; set; } = string.Empty;
    public Gender Gender { get; set; }
    public string GenderText { get; set; } = string.Empty;
    public int AgeInMonths { get; set; }
    public string AgeText { get; set; } = string.Empty;
    public string? MainImageUrl { get; set; }
    public string City { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public AdoptionStatus AdoptionStatus { get; set; }
    public string AdoptionStatusText { get; set; } = string.Empty;
    public PetOwnerType OwnerType { get; set; }
    public bool IsUrgent { get; set; }
    public bool IsVaccinated { get; set; }
    public bool IsNeutered { get; set; }
    public string DateText { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}