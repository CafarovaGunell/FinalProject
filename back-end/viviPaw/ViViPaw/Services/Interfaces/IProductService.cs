// Services/Interfaces/IProductService.cs
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.Product;

namespace ViViPaw.Services.Interfaces;

public interface IProductService
{
    Task<ApiResponse<PagedResult<ProductGetDto>>> GetAllAsync(ProductFilterDto filter);
    Task<ApiResponse<ProductDetailDto>> GetByIdAsync(int id);
    Task<ApiResponse<List<ProductGetDto>>> GetMyProductsAsync(int userId);
    Task<ApiResponse<ProductDetailDto>> CreateAsync(int userId, ProductCreateDto dto);
    Task<ApiResponse<ProductDetailDto>> UpdateAsync(int userId, bool isAdmin, int id, ProductUpdateDto dto);
    Task<ApiResponse<string>> DeleteAsync(int userId, bool isAdmin, int id);
}