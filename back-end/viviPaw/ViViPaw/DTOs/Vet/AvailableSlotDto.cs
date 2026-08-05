
namespace ViViPaw.DTOs.Vet;

public class AvailableSlotDto
{
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string DisplayText { get; set; } = string.Empty; // "14:00 - 14:30"
}