
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.Vet;
using ViViPaw.Models.Enums;

namespace ViViPaw.Services.Interfaces;

public interface IAppointmentService
{
    Task<ApiResponse<List<AvailableSlotDto>>> GetAvailableSlotsAsync(int vetProfileId, DateTime date, int serviceId);
    Task<ApiResponse<AppointmentGetDto>> CreateAsync(int userId, AppointmentCreateDto dto);
    Task<ApiResponse<List<AppointmentGetDto>>> GetMyAppointmentsAsync(int userId, AppointmentStatus? status);
    Task<ApiResponse<List<AppointmentGetDto>>> GetVetAppointmentsAsync(int userId, AppointmentStatus? status, DateTime? date);
    Task<ApiResponse<AppointmentGetDto>> GetByIdAsync(int userId, bool isAdmin, int id);
    Task<ApiResponse<string>> ChangeStatusAsync(int userId, int id, AppointmentStatus status, string? reason);
    Task<ApiResponse<string>> CancelByCustomerAsync(int userId, int id, string? reason);
}