using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ViViPaw.Data;
using ViViPaw.DTO;
using ViViPaw.Models;

namespace ViViPaw.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Mütləq giriş etmiş istifadəçilər üçündür
    public class WishlistController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WishlistController(AppDbContext context)
        {
            _context = context;
        }

        // Token-dən UserId-ni götürən köməkçi metod
        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim!);
        }

        // GET: api/Wishlist (İstifadəçinin bütün bəyəndiklərini gətirir)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WishListPetDto>>> GetMyWishlist()
        {
            int userId = GetUserId();

            var wishlistItems = await _context.WishLists
                .Where(w => w.UserId == userId)
                .Include(w => w.Pet)
                    .ThenInclude(p => p.Category)
                .Select(w => new WishListPetDto
                {
                    Id = w.Pet.Id,
                    Name = w.Pet.Name,
                    Breed = w.Pet.Breed,
                    Gender = w.Pet.Gender,
                    AgeInMonths = w.Pet.AgeInMonths,
                    ImageUrl = w.Pet.ImageUrl,
                    Location = w.Pet.Location,
                    IsAdopted = w.Pet.IsAdopted,
                    CategoryName = w.Pet.Category != null ? w.Pet.Category.Name : null
                })
                .ToListAsync();

            return Ok(wishlistItems);
        }

        // POST: api/Wishlist/toggle/{petId} (Varsa silir, yoxdursa elave edir)
        [HttpPost("toggle/{petId}")]
        public async Task<IActionResult> ToggleWishlist(int petId)
        {
            int userId = GetUserId();

            // Heyvanın mövcudluğunu yoxlayırıq
            var petExists = await _context.Pets.AnyAsync(p => p.Id == petId);
            if (!petExists)
            {
                return NotFound("Heyvan tapılmadı.");
            }

            var existingItem = await _context.WishLists
                .FirstOrDefaultAsync(w => w.UserId == userId && w.PetId == petId);

            if (existingItem != null)
            {
                // Əgər artıq wishlist-də varsa -> SİLİRİK
                _context.WishLists.Remove(existingItem);
                await _context.SaveChangesAsync();
                return Ok(new { isLiked = false, message = "Wishlist-dən çıxarıldı." });
            }
            else
            {
                // Əgər yoxdursa -> ƏLAVƏ EDİRİK
                var newItem = new WishList
                {
                    UserId = userId,
                    PetId = petId
                };
                _context.WishLists.Add(newItem);
                await _context.SaveChangesAsync();
                return Ok(new { isLiked = true, message = "Wishlist-ə əlavə olundu." });
            }
        }
    }
}