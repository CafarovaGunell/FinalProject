
using ViViPaw.Models.Base;
using ViViPaw.Models.Identity;

namespace ViViPaw.Models.Adoption;

public class WishList : BaseEntity
{
    public int AppUserId { get; set; }
    public AppUser AppUser { get; set; } = null!;

    public int PetId { get; set; }
    public Pet Pet { get; set; } = null!;
}