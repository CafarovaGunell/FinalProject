using ViViPaw.Models.Base;

namespace ViViPaw.Models
{
    public class WishList:BaseEntity
    {
        public int UserId { get; set; }
        public AppUser User { get; set; } = null!;

        public int PetId { get; set; }
        public Pet Pet { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

}
