
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.WishList;

namespace ViViPaw.Services.Interfaces;

public interface IWishListService
{
    Task<ApiResponse<List<WishListPetDto>>> GetMyListAsync(int userId);
    Task<ApiResponse<string>> ToggleAsync(int userId, int petId);
    Task<ApiResponse<List<int>>> GetMyPetIdsAsync(int userId);
}