// Models/Vet/VeterinarianProfile.cs
using ViViPaw.Models.Base;
using ViViPaw.Models.Common;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Identity;

namespace ViViPaw.Models.Vet;

public class VeterinarianProfile : BaseEntity
{
    public int AppUserId { get; set; }
    public AppUser AppUser { get; set; } = null!;

    public string ClinicName { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public int ExperienceYears { get; set; }
    public string LicenseNumber { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? ImageUrl { get; set; }

    public string Phone { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public ApprovalStatus ApprovalStatus { get; set; } = ApprovalStatus.Pending;
    public string? RejectReason { get; set; }
    public DateTime? ApprovedAt { get; set; }

    public ICollection<VetService> Services { get; set; } = new List<VetService>();
    public ICollection<VetSchedule> Schedules { get; set; } = new List<VetSchedule>();
    public ICollection<VetTimeOff> TimeOffs { get; set; } = new List<VetTimeOff>();
    public ICollection<VetAppointment> Appointments { get; set; } = new List<VetAppointment>();
    public ICollection<PetCareArticle> Articles { get; set; } = new List<PetCareArticle>();
}