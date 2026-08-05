
using ViViPaw.Models.Base;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Identity;

namespace ViViPaw.Models.Shop;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;   // VP-20250612-0001

    public int CustomerUserId { get; set; }
    public AppUser CustomerUser { get; set; } = null!;

    // Çatdırılma snapshot-u
    public string ShippingFullName { get; set; } = string.Empty;
    public string ShippingPhone { get; set; } = string.Empty;
    public string ShippingCity { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string? Note { get; set; }

    public decimal SubTotal { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal TotalAmount { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public string? CancelReason { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}