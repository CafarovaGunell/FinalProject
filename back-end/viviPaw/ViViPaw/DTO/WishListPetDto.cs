namespace ViViPaw.DTO
{
    public class WishListPetDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Breed { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public int AgeInMonths { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public bool IsAdopted { get; set; }
        public string? CategoryName { get; set; }
    }
}
