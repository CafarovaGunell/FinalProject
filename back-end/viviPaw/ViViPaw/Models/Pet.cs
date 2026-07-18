namespace ViViPaw.Models
{
    public class Pet
    {
        public int Id { get; set; }

        public string Name { get; set; } // "Badi"

        public string Breed { get; set; } // Cinsi: "Golden Retriever"

        public string Gender { get; set; } // Cinsi: "Erkək" (və ya enum edə bilərsiniz)

        public int AgeInMonths { get; set; } // Yaşı ay olaraq saxlamaq daha yaxşıdır: "3" (aylıq)

        public string ImageUrl { get; set; } // İtin şəklinin linki

        public string Location { get; set; } // "Bakı"

        public DateTime CreatedAt { get; set; } = DateTime.Now; // Elanın tarixi: "Bugün" (bunu hesablamaq üçün)


        public bool IsAdopted { get; set; } // Sahibləndirilib-sahibləndirilmədiyini yoxlamaq üçün
    }
}
