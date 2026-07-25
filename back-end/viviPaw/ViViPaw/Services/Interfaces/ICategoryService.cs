// Services/Interfaces/ICategoryService.cs
using ViViPaw.DTOs.Category;
using ViViPaw.DTOs.Common;
using ViViPaw.Models.Enums;

namespace ViViPaw.Services.Interfaces;

public interface ICategoryService
{
    Task<ApiResponse<List<CategoryGetDto>>> GetAllAsync(CategoryType? type);
    Task<ApiResponse<CategoryGetDto>> GetByIdAsync(int id);
    Task<ApiResponse<CategoryGetDto>> CreateAsync(CategoryCreateDto dto);
    Task<ApiResponse<CategoryGetDto>> UpdateAsync(int id, CategoryCreateDto dto);
    Task<ApiResponse<string>> DeleteAsync(int id);
}