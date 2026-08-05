
using ViViPaw.Models.Base;
using ViViPaw.Models.Identity;

namespace ViViPaw.Models.Shop;

public class ProductReview : BaseEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int AppUserId { get; set; }
    public AppUser AppUser { get; set; } = null!;

    public int Rating { get; set; }          // 1-5
    public string Comment { get; set; } = string.Empty;
    public bool IsApproved { get; set; } = true;
}