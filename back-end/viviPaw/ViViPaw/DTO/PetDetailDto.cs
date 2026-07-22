namespace ViViPaw.DTO
{
    public class PetDetailDto
    {
        // 1. Əsas Pet məlumatları (AutoMapper bunları avtomatik adından tapacaq)
        public int Id { get; set; }
        public string Name { get; set; }
        public string Breed { get; set; }
        public string Gender { get; set; }
        public string ImageUrl { get; set; }
        public string Location { get; set; }
        public bool IsAdopted { get; set; }

        // 2. MappingProfile-da xüsusi hesablanan sahələr
        public string AgeText { get; set; }
        public string DateText { get; set; }
        public bool IsUrgent { get; set; }

        // 3. Kateqoriya
        public string CategoryName { get; set; }

        // 4. PetShop / Sığınacaq Məlumatları
        public int PetShopId { get; set; }
        public string PetShopName { get; set; }
        public string? PetShopLogo { get; set; }
        public string? PetShopPhone { get; set; }
        public string? PetShopEmail { get; set; }
        public string? PetShopInstagram { get; set; }
        public string? PetShopAddress { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
