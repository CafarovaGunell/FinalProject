// Services/Interfaces/ITokenService.cs
using System.Security.Claims;
using ViViPaw.Models.Identity;

namespace ViViPaw.Services.Interfaces;

public interface ITokenService
{
    (string token, DateTime expiresAt) CreateAccessToken(AppUser user, IList<string> roles);
    string CreateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}