// DTOs/Vet/VetScheduleDto.cs
using System.ComponentModel.DataAnnotations;

namespace ViViPaw.DTOs.Vet;

public class VetScheduleCreateDto
{
    [Required]
    public DayOfWeek DayOfWeek { get; set; }

    [Required]
    public TimeOnly StartTime { get; set; }

    [Required]
    public TimeOnly EndTime { get; set; }

    public TimeOnly? BreakStart { get; set; }
    public TimeOnly? BreakEnd { get; set; }

    [Range(10, 120)]
    public int SlotDurationMinutes { get; set; } = 30;
}

public class VetScheduleGetDto
{
    public int Id { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public string DayName { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty; // "09:00"
    public string EndTime { get; set; } = string.Empty;
    public string? BreakStart { get; set; }
    public string? BreakEnd { get; set; }
    public int SlotDurationMinutes { get; set; }
    public bool IsActive { get; set; }
}