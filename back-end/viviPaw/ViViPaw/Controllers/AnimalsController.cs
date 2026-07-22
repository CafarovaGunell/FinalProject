using AutoMapper;
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
        private readonly IMapper _mapper;

        public AnimalsController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper; 
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


        // GET: api/Animals/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PetDetailDto>> GetPet(int id)
        {
            // 1. Data-nı bazadan Category və PetShop əlaqələri ilə birgə çəkirik
            var pet = await _context.Pets
                .Include(p => p.Category)
                .Include(p => p.PetShop)
                .FirstOrDefaultAsync(p => p.Id == id);

            // 2. Əgər tapılmadısa 404 qaytarırıq
            if (pet == null)
            {
                return NotFound(new { message = "Heyvan tapılmadı" });
            }

            // 3. AutoMapper ilə Entity-ni DTO-ya çeviririk (CƏMİ 1 SƏTİR)
            var petDetail = _mapper.Map<PetDetailDto>(pet);

            // 4. Məlumatı göndəririk
            return Ok(petDetail);
        }
    }
}