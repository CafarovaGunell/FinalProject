// Models/Vet/VetService.cs
using ViViPaw.Models.Base;

namespace ViViPaw.Models.Vet;

public class VetService : BaseEntity
{
    public int VeterinarianProfileId { get; set; }
    public VeterinarianProfile VeterinarianProfile { get; set; } = null!;

    public string Name { get; set; } = string.Empty;      // Peyvənd, Ümumi müayinə...
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int DurationMinutes { get; set; } = 30;
    public bool IsActive { get; set; } = true;
}