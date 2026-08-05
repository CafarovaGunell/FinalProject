
using System.ComponentModel.DataAnnotations;

namespace ViViPaw.DTOs.Vet;

public class VetProfileCreateDto
{
    [Required, MaxLength(120)]
    public string ClinicName { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Specialty { get; set; } = string.Empty;

    [Range(0, 60)]
    public int ExperienceYears { get; set; }

    [Required]
    public string LicenseNumber { get; set; } = string.Empty;

    public string? Bio { get; set; }
    public string? ImageUrl { get; set; }

    [Required, Phone]
    public string Phone { get; set; } = string.Empty;

    [Required]
    public string City { get; set; } = string.Empty;

    [Required]
    public string Address { get; set; } = string.Empty;

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}
// UserId YOXDUR - JWT-dən