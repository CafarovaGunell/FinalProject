
using ViViPaw.Models.Base;
using ViViPaw.Models.Identity;

namespace ViViPaw.Models.Shop;

public class FavoriteProduct : BaseEntity
{
    public int AppUserId { get; set; }
    public AppUser AppUser { get; set; } = null!;
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
}