// DTOs/Vet/AppointmentCreateDto.cs
using System.ComponentModel.DataAnnotations;

namespace ViViPaw.DTOs.Vet;

public class AppointmentCreateDto
{
    [Required]
    public int VeterinarianProfileId { get; set; }

    [Required]
    public int VetServiceId { get; set; }

    /// <summary>Seçilmiş slotun başlanğıc vaxtı</summary>
    [Required]
    public DateTime StartTime { get; set; }

    public int? PetId { get; set; }

    /// <summary>Pet platformada yoxdursa</summary>
    public string? PetInfo { get; set; }

    [Required, Phone]
    public string ClientPhone { get; set; } = string.Empty;

    public string? Notes { get; set; }
}
// CustomerUserId və Status YOXDUR