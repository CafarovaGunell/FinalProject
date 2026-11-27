
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.Testimonial;
using ViViPaw.Models.Enums;

namespace ViViPaw.Services.Interfaces;

public interface ITestimonialService
{
    Task<ApiResponse<List<TestimonialGetDto>>> GetApprovedAsync(int? currentUserId);
    Task<ApiResponse<List<TestimonialGetDto>>> GetPendingAsync();
    Task<ApiResponse<List<TestimonialGetDto>>> GetMineAsync(int userId);
    Task<ApiResponse<TestimonialGetDto>> CreateAsync(int userId, TestimonialCreateDto dto);
    Task<ApiResponse<string>> ToggleLikeAsync(int userId, int testimonialId);
    Task<ApiResponse<string>> ApproveAsync(int id, bool approve);
    Task<ApiResponse<string>> DeleteAsync(int userId, bool isAdmin, int id);


    Task<ApiResponse<List<TestimonialGetDto>>> GetAdminByStatusAsync(
    ApprovalStatus status
);

    Task<ApiResponse<string>> AdminDeleteRejectedAsync(int id);

    Task<ApiResponse<TestimonialGetDto>> UpdateAsync(int userId,int id,TestimonialCreateDto dto);
}


