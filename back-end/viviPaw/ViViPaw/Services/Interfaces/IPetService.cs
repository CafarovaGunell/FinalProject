
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.Pet;
using ViViPaw.Models.Enums;

namespace ViViPaw.Services.Interfaces;

public interface IPetService
{
    Task<ApiResponse<PagedResult<PetGetDto>>> GetAllAsync(PetFilterDto filter);
    Task<ApiResponse<PetDetailDto>> GetByIdAsync(int id);
    Task<ApiResponse<PetDetailDto>> CreateAsync(int userId, PetCreateDto dto);
    Task<ApiResponse<PetDetailDto>> UpdateAsync(int userId, bool isAdmin, int petId, PetUpdateDto dto);
    Task<ApiResponse<string>> DeleteAsync(int userId, bool isAdmin, int petId);
    Task<ApiResponse<List<PetGetDto>>> GetMyPetsAsync(int userId);

    // Admin
    Task<ApiResponse<PagedResult<PetGetDto>>> GetPendingAsync(int page, int pageSize);
    Task<ApiResponse<string>> ApproveAsync(int petId, bool approve, string? reason);

    Task<ApiResponse<List<PetGetDto>>> GetAdminByStatusAsync(
    ApprovalStatus status
);

    Task<ApiResponse<string>> AdminDeleteRejectedAsync(int petId);
}


