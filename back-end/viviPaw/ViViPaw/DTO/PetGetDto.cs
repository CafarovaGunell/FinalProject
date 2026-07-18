namespace ViViPaw.DTO
{
    public class PetGetDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Breed { get; set; }
        public string Gender { get; set; }
        public string AgeText { get; set; } // Məsələn: "3 aylıq" və ya "1 yaş" formatında birləşdirilmiş mətn
        public string ImageUrl { get; set; }
        public string Location { get; set; }
        public string DateText { get; set; } // Tarixi analiz edib frontend-ə birbaşa "Bugün", "Dünən" və ya "18.07.2026" ötürmək üçün
        public bool IsUrgent { get; set; }
    }
}
