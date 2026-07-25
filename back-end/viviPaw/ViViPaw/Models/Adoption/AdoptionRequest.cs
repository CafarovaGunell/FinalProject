// Models/Adoption/AdoptionRequest.cs
using ViViPaw.Models.Base;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Identity;

namespace ViViPaw.Models.Adoption;

public class AdoptionRequest : BaseEntity
{
    public int PetId { get; set; }
    public Pet Pet { get; set; } = null!;

    public int ApplicantUserId { get; set; }
    public AppUser ApplicantUser { get; set; } = null!;

    // Müraciət anındakı snapshot (user sonra profilini dəyişsə də qalır)
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string HousingType { get; set; } = string.Empty;   // Ev / Mənzil / Həyət
    public bool HasOtherPets { get; set; }
    public string Reason { get; set; } = string.Empty;

    // --- Cavab ---
    public RequestStatus Status { get; set; } = RequestStatus.Pending;
    public string? ReviewNote { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public int? ReviewedByUserId { get; set; }
}