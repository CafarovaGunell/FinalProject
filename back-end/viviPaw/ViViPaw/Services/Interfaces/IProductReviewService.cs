using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.Product;
using ViViPaw.Models.Enums;

namespace ViViPaw.Services.Interfaces;

public interface IProductReviewService
{
    Task<ApiResponse<List<ProductReviewGetDto>>> GetByProductAsync(
        int productId
    );

    Task<ApiResponse<ProductReviewGetDto>> CreateAsync(
        int userId,
        ProductReviewCreateDto dto
    );

    Task<ApiResponse<ProductReviewGetDto>> UpdateAsync(
        int userId,
        int id,
        ProductReviewCreateDto dto
    );

    Task<ApiResponse<string>> DeleteAsync(
        int userId,
        bool isAdmin,
        int id
    );

    Task<ApiResponse<List<ProductReviewGetDto>>> GetAdminAsync(
        ApprovalStatus status
    );

    Task<ApiResponse<string>> ApproveAsync(
        int id
    );

    Task<ApiResponse<string>> RejectAsync(
        int id
    );
}