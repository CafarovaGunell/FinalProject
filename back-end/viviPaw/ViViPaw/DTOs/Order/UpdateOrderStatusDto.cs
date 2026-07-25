// DTOs/Order/UpdateOrderStatusDto.cs
using System.ComponentModel.DataAnnotations;
using ViViPaw.Models.Enums;

namespace ViViPaw.DTOs.Order;

public class UpdateOrderStatusDto
{
    [Required]
    public OrderStatus Status { get; set; }

    public string? CancelReason { get; set; }
}