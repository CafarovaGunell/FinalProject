// Models/Vet/VetTimeOff.cs
using ViViPaw.Models.Base;

namespace ViViPaw.Models.Vet;

/// <summary>Məzuniyyət / bağlı günlər</summary>
public class VetTimeOff : BaseEntity
{
    public int VeterinarianProfileId { get; set; }
    public VeterinarianProfile VeterinarianProfile { get; set; } = null!;

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Reason { get; set; }
}