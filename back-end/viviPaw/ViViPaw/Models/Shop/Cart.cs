
using ViViPaw.Models.Base;
using ViViPaw.Models.Identity;

namespace ViViPaw.Models.Shop;

public class Cart : BaseEntity
{
    public int AppUserId { get; set; }
    public AppUser AppUser { get; set; } = null!;
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}

