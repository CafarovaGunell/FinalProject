using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ViViPaw.Data;
using ViViPaw.DTO;
using ViViPaw.Helpers; // FormatHelpers klassını tanıması üçün

namespace ViViPaw.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnimalsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnimalsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Animals
        // Kartlarda göstəriləcək DTO məlumatlarını qaytarır
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PetGetDto>>> GetPets()
        {
            var pets = await _context.Pets
                .Include(p => p.Category) // CategoryName məlumatını götürə bilmək üçün VACİBDİR
                .Where(p => !p.IsAdopted) // Sırf hələ sahiblənilməyən heyvanlar
                .OrderByDescending(p => p.CreatedAt) // Ən yenilər birinci gəlsin
                .ToListAsync();

            // Bazadan gələn heyvanları kart üçün PetGetDto formatına çeviririk
            var petCards = pets.Select(p => new PetGetDto
            {
                Id = p.Id, // React-də key və wishlist üçün
                Name = p.Name,
                Breed = p.Breed,
                Gender = p.Gender,
                ImageUrl = p.ImageUrl,
                Location = p.Location,
                CategoryName = p.Category != null ? p.Category.Name : "Naməlum", // "İt" və ya "Pişik"
                AgeText = FormatHelpers.FormatAge(p.AgeInMonths),
                DateText = FormatHelpers.FormatDate(p.CreatedAt),
                IsUrgent = p.AgeInMonths <= 1 // 1 aylıq və daha kiçik körpələr üçün "Təcili" etiketi
            }).ToList();

            return Ok(petCards);
        }
    }
}