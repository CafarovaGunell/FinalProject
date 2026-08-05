
using ViViPaw.Models.Enums;

namespace ViViPaw.DTOs.Vet;

public class VetProfileGetDto
{
    public int Id { get; set; }
    public string ClinicName { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public int ExperienceYears { get; set; }
    public string? Bio { get; set; }
    public string? ImageUrl { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public ApprovalStatus ApprovalStatus { get; set; }
    public string ApprovalStatusText { get; set; } = string.Empty;
    public string VeterinarianFullName { get; set; } = string.Empty;
    public List<VetServiceGetDto> Services { get; set; } = new();
}