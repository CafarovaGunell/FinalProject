
using System.ComponentModel.DataAnnotations;

namespace ViViPaw.DTOs.Order;

public class OrderCreateDto
{
    [Required, MaxLength(100)]
    public string ShippingFullName { get; set; } = string.Empty;

    [Required, Phone]
    public string ShippingPhone { get; set; } = string.Empty;

    [Required]
    public string ShippingCity { get; set; } = string.Empty;

    [Required, MaxLength(300)]
    public string ShippingAddress { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Note { get; set; }
}