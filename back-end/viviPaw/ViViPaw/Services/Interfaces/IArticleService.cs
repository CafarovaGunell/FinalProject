
using ViViPaw.DTOs.Article;
using ViViPaw.DTOs.Common;

namespace ViViPaw.Services.Interfaces;

public interface IArticleService
{
    Task<ApiResponse<PagedResult<ArticleGetDto>>> GetAllAsync(int? categoryId, string? search, int page, int pageSize);
    Task<ApiResponse<ArticleGetDto>> GetBySlugAsync(string slug);
    Task<ApiResponse<List<ArticleGetDto>>> GetMineAsync(int userId);
    Task<ApiResponse<ArticleGetDto>> CreateAsync(int userId, ArticleCreateDto dto);
    Task<ApiResponse<ArticleGetDto>> UpdateAsync(int userId, bool isAdmin, int id, ArticleUpdateDto dto);
    Task<ApiResponse<string>> DeleteAsync(int userId, bool isAdmin, int id);
}