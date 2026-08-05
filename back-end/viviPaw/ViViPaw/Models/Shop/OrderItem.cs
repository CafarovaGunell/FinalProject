
using ViViPaw.Models.Base;

namespace ViViPaw.Models.Shop;

public class OrderItem : BaseEntity
{
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int PetShopId { get; set; }              // hansı mağaza satıb (panel üçün)
    public PetShop PetShop { get; set; } = null!;

    // SNAPSHOT 
    public string ProductName { get; set; } = string.Empty;
    public string? ProductImageUrl { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal => UnitPrice * Quantity;
}