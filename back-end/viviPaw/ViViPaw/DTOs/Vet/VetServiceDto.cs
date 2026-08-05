
using System.ComponentModel.DataAnnotations;

namespace ViViPaw.DTOs.Vet;

public class VetServiceCreateDto
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Range(0, 10000)]
    public decimal Price { get; set; }

    [Range(10, 240)]
    public int DurationMinutes { get; set; } = 30;
}

public class VetServiceGetDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int DurationMinutes { get; set; }
    public bool IsActive { get; set; }
}