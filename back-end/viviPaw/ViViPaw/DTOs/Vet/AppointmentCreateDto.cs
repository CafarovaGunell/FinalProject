
using System.ComponentModel.DataAnnotations;

namespace ViViPaw.DTOs.Vet;

public class AppointmentCreateDto
{
    [Required]
    public int VeterinarianProfileId { get; set; }

    [Required]
    public int VetServiceId { get; set; }

    //Seçilmiş slotun başlanğıc vaxtı
    [Required]
    public DateTime StartTime { get; set; }

    public int? PetId { get; set; }

    //Pet platformada yoxdursa
    public string? PetInfo { get; set; }

    [Required, Phone]
    public string ClientPhone { get; set; } = string.Empty;

    public string? Notes { get; set; }
}
