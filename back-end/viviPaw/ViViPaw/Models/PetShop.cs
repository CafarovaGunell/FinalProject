using ViViPaw.Models.Base;

namespace ViViPaw.Models
{
    public class PetShop:BaseEntity
    {
        public string Name { get; set; } // Məsələn: "ViViPaw Bakı Mərkəzi"
        public string Description { get; set; } // Petshop haqqında haqqımızda mətni
        public string LogoUrl { get; set; } // Petshop-un loqosunun və ya şəklinin linki

        // 2. Əlaqə Vasitələri
        public string Phone { get; set; } // "+994 50 123 45 67"
        public string Email { get; set; } // "baku@vivipaw.com"
        public string Instagram { get; set; } // "@vivipaw_baku"
        public string? WebsiteUrl { get; set; } // "https://vivipaw.com" (istəyə bağlı)

        // 3. Ünvan və Xəritə (Location)
        public string Address { get; set; } // "Nərimanov ray., Əhməd Rəcəbli küç. 15"
        public string City { get; set; } // "Bakı"

        // Xəritədə nöqtəni göstərmək üçün koordinatlar (React-də Google Maps / Leaflet üçün)
        public double Latitude { get; set; } // Enlik (Məsələn: 40.4093)
        public double Longitude { get; set; } // Uzunluq (Məsələn: 49.8671)

        // 4. Əlaqələr (Relationships)
        // Bir PetShop-un daxilində çoxlu heyvan ola bilər (One-to-Many)
        public ICollection<Pet> Pets { get; set; }
    }
}
