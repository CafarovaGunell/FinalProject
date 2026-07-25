// DTOs/Adoption/AdoptionRequestGetDto.cs
using ViViPaw.Models.Enums;

namespace ViViPaw.DTOs.Adoption;

public class AdoptionRequestGetDto
{
    public int Id { get; set; }
    public int PetId { get; set; }
    public string PetName { get; set; } = string.Empty;
    public string? PetImageUrl { get; set; }

    public int ApplicantUserId { get; set; }
    public string ApplicantFullName { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string HousingType { get; set; } = string.Empty;
    public bool HasOtherPets { get; set; }
    public string Reason { get; set; } = string.Empty;

    public RequestStatus Status { get; set; }
    public string StatusText { get; set; } = string.Empty;
    public string? ReviewNote { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public string DateText { get; set; } = string.Empty;
}