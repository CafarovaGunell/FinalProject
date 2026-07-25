// Services/Interfaces/IAdoptionRequestService.cs
using ViViPaw.DTOs.Adoption;
using ViViPaw.DTOs.Common;

namespace ViViPaw.Services.Interfaces;

public interface IAdoptionRequestService
{
    Task<ApiResponse<AdoptionRequestGetDto>> CreateAsync(int userId, AdoptionRequestCreateDto dto);
    Task<ApiResponse<List<AdoptionRequestGetDto>>> GetMyRequestsAsync(int userId);
    Task<ApiResponse<List<AdoptionRequestGetDto>>> GetReceivedAsync(int userId);
    Task<ApiResponse<List<AdoptionRequestGetDto>>> GetByPetAsync(int userId, int petId);
    Task<ApiResponse<string>> ReviewAsync(int userId, int requestId, AdoptionRequestReviewDto dto);
    Task<ApiResponse<string>> CancelAsync(int userId, int requestId);
}