using ViViPaw.Models.Base;

namespace ViViPaw.Models
{
    public class Category : BaseEntity
    {
        public string Name { get; set; } // Məsələn: "İt", "Pişik", "Quş"
        public string? Description { get; set; } // Kateqoriya haqqında qısa açıqlama

        // İlişki: Boş siyahı ilə başlatmaq Null xətasının qarşısını alır
        public List<Pet> Pets { get; set; } = new List<Pet>();
    }
}
