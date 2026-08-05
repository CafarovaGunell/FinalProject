
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.Vet;

namespace ViViPaw.Services.Interfaces;

public interface IVetManagementService
{
    // Xidmətlər
    Task<ApiResponse<List<VetServiceGetDto>>> GetServicesAsync(int vetProfileId);
    Task<ApiResponse<VetServiceGetDto>> CreateServiceAsync(int userId, VetServiceCreateDto dto);
    Task<ApiResponse<VetServiceGetDto>> UpdateServiceAsync(int userId, int id, VetServiceCreateDto dto);
    Task<ApiResponse<string>> DeleteServiceAsync(int userId, int id);

    // Qrafik
    Task<ApiResponse<List<VetScheduleGetDto>>> GetSchedulesAsync(int vetProfileId);
    Task<ApiResponse<VetScheduleGetDto>> CreateScheduleAsync(int userId, VetScheduleCreateDto dto);
    Task<ApiResponse<string>> DeleteScheduleAsync(int userId, int id);

    // Məzuniyyət
    Task<ApiResponse<List<VetTimeOffGetDto>>> GetTimeOffsAsync(int userId);
    Task<ApiResponse<VetTimeOffGetDto>> CreateTimeOffAsync(int userId, VetTimeOffCreateDto dto);
    Task<ApiResponse<string>> DeleteTimeOffAsync(int userId, int id);


    Task<ApiResponse<string>> DeleteRejectedVetAsync(int vetId);
}