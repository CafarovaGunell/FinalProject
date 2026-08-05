
using System.ComponentModel.DataAnnotations;

namespace ViViPaw.DTOs.Adoption;

public class AdoptionRequestCreateDto
{
    [Required]
    public int PetId { get; set; }

    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, Phone]
    public string Phone { get; set; } = string.Empty;

    [Required, MaxLength(300)]
    public string Address { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string HousingType { get; set; } = string.Empty; // Ev / Mənzil / Həyət

    public bool HasOtherPets { get; set; }

    [Required, MaxLength(1000)]
    public string Reason { get; set; } = string.Empty;
}