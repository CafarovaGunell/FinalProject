// DTOs/Admin/ApprovalDto.cs
using System.ComponentModel.DataAnnotations;
using ViViPaw.Models.Enums;

namespace ViViPaw.DTOs.Admin;

public class ApprovalDto
{
    /// <summary>Approved (2) və ya Rejected (3)</summary>
    [Required]
    public ApprovalStatus Status { get; set; }

    [MaxLength(500)]
    public string? RejectReason { get; set; }
}