// DTOs/Vet/AppointmentGetDto.cs
using ViViPaw.Models.Enums;

namespace ViViPaw.DTOs.Vet;

public class AppointmentGetDto
{
    public int Id { get; set; }
    public int VeterinarianProfileId { get; set; }
    public string ClinicName { get; set; } = string.Empty;
    public string VeterinarianName { get; set; } = string.Empty;

    public int VetServiceId { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public decimal Price { get; set; }

    public int? PetId { get; set; }
    public string? PetName { get; set; }
    public string? PetInfo { get; set; }

    public string ClientPhone { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string TimeText { get; set; } = string.Empty;
    public string? Notes { get; set; }

    public AppointmentStatus Status { get; set; }
    public string StatusText { get; set; } = string.Empty;
    public string? CancelReason { get; set; }

    public int CustomerUserId { get; set; }
    public string CustomerFullName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}