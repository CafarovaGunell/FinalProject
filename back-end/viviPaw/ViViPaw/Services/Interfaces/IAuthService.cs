
using ViViPaw.DTOs.Auth;
using ViViPaw.DTOs.Common;

namespace ViViPaw.Services.Interfaces;

public interface IAuthService
{
    Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterDto dto);
    Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto dto);
    Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(RefreshTokenDto dto);
    Task<ApiResponse<string>> LogoutAsync(int userId, string refreshToken);
    Task<ApiResponse<string>> ChangePasswordAsync(int userId, ChangePasswordDto dto);
}



