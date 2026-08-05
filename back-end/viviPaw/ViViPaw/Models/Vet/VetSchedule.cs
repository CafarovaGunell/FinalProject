
using ViViPaw.Models.Base;

namespace ViViPaw.Models.Vet;

//Baytarın həftəlik iş qrafiki (bir gün üçün bir sətir)
public class VetSchedule : BaseEntity
{
    public int VeterinarianProfileId { get; set; }
    public VeterinarianProfile VeterinarianProfile { get; set; } = null!;

    public DayOfWeek DayOfWeek { get; set; }
    public TimeOnly StartTime { get; set; }              
    public TimeOnly EndTime { get; set; }                
    public TimeOnly? BreakStart { get; set; }       
    public TimeOnly? BreakEnd { get; set; }          
    public int SlotDurationMinutes { get; set; } = 30;
    public bool IsActive { get; set; } = true;
}