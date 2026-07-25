// Models/Vet/VetSchedule.cs
using ViViPaw.Models.Base;

namespace ViViPaw.Models.Vet;

/// <summary>Baytarın həftəlik iş qrafiki (bir gün üçün bir sətir)</summary>
public class VetSchedule : BaseEntity
{
    public int VeterinarianProfileId { get; set; }
    public VeterinarianProfile VeterinarianProfile { get; set; } = null!;

    public DayOfWeek DayOfWeek { get; set; }
    public TimeOnly StartTime { get; set; }              // 09:00
    public TimeOnly EndTime { get; set; }                // 18:00
    public TimeOnly? BreakStart { get; set; }            // 13:00
    public TimeOnly? BreakEnd { get; set; }              // 14:00
    public int SlotDurationMinutes { get; set; } = 30;
    public bool IsActive { get; set; } = true;
}