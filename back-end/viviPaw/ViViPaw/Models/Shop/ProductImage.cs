
using ViViPaw.Models.Base;

namespace ViViPaw.Models.Shop;

public class ProductImage : BaseEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsMain { get; set; } = false;
}