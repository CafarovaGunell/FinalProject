
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.Product;

namespace ViViPaw.Services.Interfaces;

public interface IProductReviewService
{
    Task<ApiResponse<List<ProductReviewGetDto>>> GetByProductAsync(int productId);
    Task<ApiResponse<ProductReviewGetDto>> CreateAsync(int userId, ProductReviewCreateDto dto);
    Task<ApiResponse<string>> DeleteAsync(int userId, bool isAdmin, int id);
}