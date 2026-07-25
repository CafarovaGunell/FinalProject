
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.User;

namespace ViViPaw.Services.Interfaces;

public interface IUserProfileService
{
    Task<ApiResponse<UserGetDto>> GetMyProfileAsync(int userId);
    Task<ApiResponse<UserGetDto>> UpdateAsync(int userId, UpdateProfileDto dto);
    Task<ApiResponse<List<UserGetDto>>> GetAllAsync(string? role, string? search);
    Task<ApiResponse<string>> SetActiveAsync(int userId, bool isActive);
}