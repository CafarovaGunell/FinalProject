
using ViViPaw.DTOs.Admin;
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.Vet;
using ViViPaw.Models.Enums;

namespace ViViPaw.Services.Interfaces;

public interface IVetProfileService
{
    Task<ApiResponse<VetProfileGetDto>> CreateAsync(int userId, VetProfileCreateDto dto);
    Task<ApiResponse<VetProfileGetDto>> UpdateAsync(int userId, VetProfileUpdateDto dto);
    Task<ApiResponse<VetProfileGetDto>> GetMyProfileAsync(int userId);
    Task<ApiResponse<VetProfileGetDto>> GetByIdAsync(int id);
    Task<ApiResponse<List<VetProfileGetDto>>> GetAllAsync(ApprovalStatus? status, string? city, string? specialty);
    Task<ApiResponse<string>> ApproveAsync(int vetId, int adminId, ApprovalDto dto);
}