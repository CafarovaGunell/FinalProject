
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ViViPaw.Data;
using ViViPaw.DTOs.Auth;
using ViViPaw.DTOs.Common;
using ViViPaw.Helpers;
using ViViPaw.Models.Identity;
using ViViPaw.Models.Shop;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly AppDbContext _db;
    private readonly JwtSettings _jwt;

    public AuthService(
        UserManager<AppUser> userManager,
        ITokenService tokenService,
        AppDbContext db,
        IOptions<JwtSettings> jwt)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _db = db;
        _jwt = jwt.Value;
    }

    //REGISTER
    public async Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterDto dto)
    {
        // Yalnız bu rollarla açıq qeydiyyat mümkündür
        var allowed = new[] { Roles.Customer, Roles.PetShop, Roles.Veterinarian };
        if (!allowed.Contains(dto.Role))
            return ApiResponse<AuthResponseDto>.Fail("Yanlış rol seçimi.");

        if (await _userManager.FindByEmailAsync(dto.Email) is not null)
            return ApiResponse<AuthResponseDto>.Fail("Bu e-poçt artıq qeydiyyatdan keçib.");

        var user = new AppUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FullName = dto.FullName,
            PhoneNumber = dto.PhoneNumber,
            City = dto.City,
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return ApiResponse<AuthResponseDto>.Fail(
                "Qeydiyyat uğursuz oldu.",
                result.Errors.Select(e => e.Description).ToList());

        await _userManager.AddToRoleAsync(user, dto.Role);


        if (dto.Role == Roles.Customer)
        {
            _db.Carts.Add(new Cart { AppUserId = user.Id });
            await _db.SaveChangesAsync();
        }

        var response = await BuildAuthResponseAsync(user);
        var msg = dto.Role == Roles.Customer
            ? "Qeydiyyat uğurla tamamlandı."
            : "Qeydiyyat tamamlandı. İndi profil məlumatlarınızı doldurun.";

        return ApiResponse<AuthResponseDto>.Ok(response, msg);
    }

    //  LOGIN 
    public async Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user is null)
            return ApiResponse<AuthResponseDto>.Fail("E-poçt və ya parol yanlışdır.");

        if (!user.IsActive)
            return ApiResponse<AuthResponseDto>.Fail("Hesabınız deaktiv edilib. Adminlə əlaqə saxlayın.");

        if (!await _userManager.CheckPasswordAsync(user, dto.Password))
            return ApiResponse<AuthResponseDto>.Fail("E-poçt və ya parol yanlışdır.");

        var response = await BuildAuthResponseAsync(user);
        return ApiResponse<AuthResponseDto>.Ok(response, "Giriş uğurludur.");
    }

    //REFRESH
    public async Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(RefreshTokenDto dto)
    {
        var principal = _tokenService.GetPrincipalFromExpiredToken(dto.AccessToken);
        if (principal is null)
            return ApiResponse<AuthResponseDto>.Fail("Yanlış access token.");

        var userId = principal.GetUserId();
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null || !user.IsActive)
            return ApiResponse<AuthResponseDto>.Fail("İstifadəçi tapılmadı.");

        var stored = await _db.RefreshTokens
            .FirstOrDefaultAsync(x => x.AppUserId == userId && x.Token == dto.RefreshToken);

        if (stored is null || !stored.IsActive)
            return ApiResponse<AuthResponseDto>.Fail("Refresh token etibarsızdır. Yenidən daxil olun.");

        stored.IsRevoked = true;               
        await _db.SaveChangesAsync();

        var response = await BuildAuthResponseAsync(user);
        return ApiResponse<AuthResponseDto>.Ok(response, "Token yeniləndi.");
    }

    // LOGOUT 
    public async Task<ApiResponse<string>> LogoutAsync(int userId, string refreshToken)
    {
        var stored = await _db.RefreshTokens
            .FirstOrDefaultAsync(x => x.AppUserId == userId && x.Token == refreshToken);

        if (stored is not null)
        {
            stored.IsRevoked = true;
            await _db.SaveChangesAsync();
        }

        return ApiResponse<string>.Ok("ok", "Çıxış edildi.");
    }

    //CHANGE PASSWORD
    public async Task<ApiResponse<string>> ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null)
            return ApiResponse<string>.Fail("İstifadəçi tapılmadı.");

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded)
            return ApiResponse<string>.Fail("Parol dəyişdirilmədi.",
                result.Errors.Select(e => e.Description).ToList());

      
        var tokens = await _db.RefreshTokens
            .Where(x => x.AppUserId == userId && !x.IsRevoked).ToListAsync();
        tokens.ForEach(t => t.IsRevoked = true);
        await _db.SaveChangesAsync();

        return ApiResponse<string>.Ok("ok", "Parol uğurla dəyişdirildi.");
    }

    //HELPER
    private async Task<AuthResponseDto> BuildAuthResponseAsync(AppUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var (accessToken, expiresAt) = _tokenService.CreateAccessToken(user, roles);
        var refreshToken = _tokenService.CreateRefreshToken();

        _db.RefreshTokens.Add(new RefreshToken
        {
            AppUserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwt.RefreshTokenDays)
        });
        await _db.SaveChangesAsync();

        var dto = new AuthResponseDto
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            ImageUrl = user.ImageUrl,
            Roles = roles.ToList(),
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt
        };

    
        if (roles.Contains(Roles.PetShop))
        {
            var shop = await _db.PetShops
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.AppUserId == user.Id && !x.IsDeleted);
            dto.PetShopId = shop?.Id;
            dto.ApprovalStatus = shop?.ApprovalStatus.ToString();
        }
        else if (roles.Contains(Roles.Veterinarian))
        {
            var vet = await _db.VeterinarianProfiles
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.AppUserId == user.Id && !x.IsDeleted);
            dto.VeterinarianProfileId = vet?.Id;
            dto.ApprovalStatus = vet?.ApprovalStatus.ToString();
        }

        return dto;
    }
}


