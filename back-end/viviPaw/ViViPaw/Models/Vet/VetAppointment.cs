
using ViViPaw.Models.Adoption;
using ViViPaw.Models.Base;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Identity;

namespace ViViPaw.Models.Vet;

public class VetAppointment : BaseEntity
{
    public int VeterinarianProfileId { get; set; }
    public VeterinarianProfile VeterinarianProfile { get; set; } = null!;

    public int CustomerUserId { get; set; }
    public AppUser CustomerUser { get; set; } = null!;

    public int VetServiceId { get; set; }
    public VetService VetService { get; set; } = null!;

    //Platformadakı heyvan (varsa)
    public int? PetId { get; set; }
    public Pet? Pet { get; set; }

    //Heyvan platformada yoxdursa: "Pişik, Mələk, 2 yaş"
    public string? PetInfo { get; set; }

    public string ClientPhone { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }        // slot başlanğıcı
    public DateTime EndTime { get; set; }          // StartTime + Service.Duration
    public decimal PriceSnapshot { get; set; }     // o anki qiymət
    public string? Notes { get; set; }

    public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;
    public string? CancelReason { get; set; }
}