
using ViViPaw.DTOs.Admin;
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.PetShop;
using ViViPaw.Models.Enums;

namespace ViViPaw.Services.Interfaces;

public interface IPetShopService
{
    Task<ApiResponse<PetShopDetailDto>> CreateAsync(int userId, PetShopCreateDto dto);
    Task<ApiResponse<PetShopDetailDto>> UpdateAsync(int userId, PetShopUpdateDto dto);
    Task<ApiResponse<PetShopDetailDto>> GetMyShopAsync(int userId);
    Task<ApiResponse<PetShopDetailDto>> GetByIdAsync(int id);
    Task<ApiResponse<List<PetShopGetDto>>> GetAllAsync(ApprovalStatus? status, string? city);
    Task<ApiResponse<string>> ApproveAsync(int shopId, int adminId, ApprovalDto dto);
    Task<ApiResponse<string>> DeleteRejectedShopAsync(int shopId);
  
}