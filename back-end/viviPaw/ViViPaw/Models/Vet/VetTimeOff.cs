
using ViViPaw.Models.Base;

namespace ViViPaw.Models.Vet;

//Məzuniyyət / bağlı günlər
public class VetTimeOff : BaseEntity
{
    public int VeterinarianProfileId { get; set; }
    public VeterinarianProfile VeterinarianProfile { get; set; } = null!;

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Reason { get; set; }
}