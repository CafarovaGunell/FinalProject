using ViViPaw.Models.Base;

namespace ViViPaw.Models
{
    public class Pet : BaseEntity
    {

        public string Name { get; set; }
        public string Breed { get; set; }
        public string Gender { get; set; }
        public int AgeInMonths { get; set; }
        public string ImageUrl { get; set; }
        public string Location { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsAdopted { get; set; }

        // PetShopId və CategoryId qalıq qalır (çünki `int`-dir)
        public int PetShopId { get; set; }
        public PetShop? PetShop { get; set; } // Nullable (?) edirik

        public int CategoryId { get; set; }
        public Category? Category { get; set; } // Nullable (?) edirik

        // --- WISHLIST ƏLAQƏSİ ---
        public ICollection<WishList> Wishlists { get; set; } = new List<WishList>();

    }
}
