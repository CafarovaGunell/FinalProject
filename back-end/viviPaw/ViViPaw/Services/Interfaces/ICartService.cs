
using ViViPaw.DTOs.Cart;
using ViViPaw.DTOs.Common;

namespace ViViPaw.Services.Interfaces;

public interface ICartService
{
    Task<ApiResponse<CartDto>> GetMyCartAsync(int userId);
    Task<ApiResponse<CartDto>> AddAsync(int userId, AddToCartDto dto);
    Task<ApiResponse<CartDto>> UpdateItemAsync(int userId, int itemId, UpdateCartItemDto dto);
    Task<ApiResponse<CartDto>> RemoveItemAsync(int userId, int itemId);
    Task<ApiResponse<string>> ClearAsync(int userId);
}