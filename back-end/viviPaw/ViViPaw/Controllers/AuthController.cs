using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ViViPaw.Data;
using ViViPaw.DTO;
using ViViPaw.Models;
using ViViPaw.Services;

namespace ViViPaw.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly TokenService _tokenService;

        public AuthController(AppDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        // POST: api/Auth/register
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
        {
            // 1. Email-in bazada olub-olmadığını yoxlayırıq
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
            {
                return BadRequest("Bu e-poçt ünvanı artıq qeydiyyatdan keçib.");
            }

            // 2. Parolu BCrypt ilə hash-ləyirik
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            // 3. Yeni istifadəçi obyekti yaradırıq
            var user = new AppUser
            {
                FullName = dto.FullName,
                Email = dto.Email.ToLower(),
                PasswordHash = passwordHash,
                Role = "User" // Susmaya görə adi istifadəçi
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // 4. Token yaradıb cavab qaytarırıq
            var token = _tokenService.CreateToken(user);

            return Ok(new AuthResponseDto
            {
                Token = token,
                FullName = user.FullName,
                Role = user.Role
            });
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
        {
            // 1. İstifadəçini email-ə görə axtarırıq
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());

            if (user == null)
            {
                return Unauthorized("E-poçt və ya parol yanlışdır.");
            }

            // 2. Parolun doğru olub-olmadığını yoxlayırıq
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);

            if (!isPasswordValid)
            {
                return Unauthorized("E-poçt və ya parol yanlışdır.");
            }

            // 3. Login uğurludursa JWT Token generasiya edirik
            var token = _tokenService.CreateToken(user);

            return Ok(new AuthResponseDto
            {
                Token = token,
                FullName = user.FullName,
                Role = user.Role
            });
        }
    }
}