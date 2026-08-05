
using System.ComponentModel.DataAnnotations;
using ViViPaw.Models.Enums;

namespace ViViPaw.DTOs.Adoption;

public class AdoptionRequestReviewDto
{
    [Required]
    public RequestStatus Status { get; set; } // Approved və ya Rejected

    [MaxLength(500)]
    public string? ReviewNote { get; set; }
}