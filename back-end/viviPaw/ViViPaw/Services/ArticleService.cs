// Services/ArticleService.cs
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using ViViPaw.Data;
using ViViPaw.DTOs.Article;
using ViViPaw.DTOs.Common;
using ViViPaw.Helpers;
using ViViPaw.Models.Common;
using ViViPaw.Models.Enums;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Services;

public class ArticleService : IArticleService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;

    public ArticleService(AppDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<ApiResponse<PagedResult<ArticleGetDto>>> GetAllAsync(
        int? categoryId, string? search, int page, int pageSize)
    {
        var q = _db.PetCareArticles.Where(x => x.IsPublished);

        if (categoryId.HasValue) q = q.Where(x => x.CategoryId == categoryId);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            q = q.Where(x => x.Title.ToLower().Contains(s) || x.ShortDescription.ToLower().Contains(s));
        }

        var total = await q.CountAsync();
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 50 ? 9 : pageSize;

        var items = await q.OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ProjectTo<ArticleGetDto>(_mapper.ConfigurationProvider).ToListAsync();

        return ApiResponse<PagedResult<ArticleGetDto>>.Ok(new PagedResult<ArticleGetDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = total
        });
    }

    public async Task<ApiResponse<ArticleGetDto>> GetBySlugAsync(string slug)
    {
        var entity = await _db.PetCareArticles.FirstOrDefaultAsync(x => x.Slug == slug && x.IsPublished);
        if (entity is null) return ApiResponse<ArticleGetDto>.Fail("Məqalə tapılmadı.");

        entity.ViewCount++;
        await _db.SaveChangesAsync();

        var dto = await _db.PetCareArticles.Where(x => x.Id == entity.Id)
            .ProjectTo<ArticleGetDto>(_mapper.ConfigurationProvider).FirstAsync();

        return ApiResponse<ArticleGetDto>.Ok(dto);
    }

    public async Task<ApiResponse<List<ArticleGetDto>>> GetMineAsync(int userId)
    {
        var vetId = await _db.VeterinarianProfiles.Where(x => x.AppUserId == userId)
            .Select(x => (int?)x.Id).FirstOrDefaultAsync();
        if (vetId is null) return ApiResponse<List<ArticleGetDto>>.Fail("Baytar profiliniz yoxdur.");

        var list = await _db.PetCareArticles.Where(x => x.VeterinarianProfileId == vetId)
            .OrderByDescending(x => x.CreatedAt)
            .ProjectTo<ArticleGetDto>(_mapper.ConfigurationProvider).ToListAsync();

        return ApiResponse<List<ArticleGetDto>>.Ok(list);
    }

    public async Task<ApiResponse<ArticleGetDto>> CreateAsync(int userId, ArticleCreateDto dto)
    {
        var vet = await _db.VeterinarianProfiles.FirstOrDefaultAsync(x => x.AppUserId == userId);
        if (vet is null) return ApiResponse<ArticleGetDto>.Fail("Baytar profiliniz yoxdur.");
        if (vet.ApprovalStatus != ApprovalStatus.Approved)
            return ApiResponse<ArticleGetDto>.Fail("Profiliniz hələ təsdiqlənməyib.");

        if (!await _db.Categories.AnyAsync(x => x.Id == dto.CategoryId && x.Type == CategoryType.Article))
            return ApiResponse<ArticleGetDto>.Fail("Yanlış məqalə kateqoriyası.");

        var entity = _mapper.Map<PetCareArticle>(dto);
        entity.VeterinarianProfileId = vet.Id;
        entity.Slug = await MakeUniqueSlugAsync(dto.Title);

        _db.PetCareArticles.Add(entity);
        await _db.SaveChangesAsync();

        var result = await _db.PetCareArticles.Where(x => x.Id == entity.Id)
            .ProjectTo<ArticleGetDto>(_mapper.ConfigurationProvider).FirstAsync();

        return ApiResponse<ArticleGetDto>.Ok(result, "Məqalə yaradıldı.");
    }

    public async Task<ApiResponse<ArticleGetDto>> UpdateAsync(int userId, bool isAdmin, int id, ArticleUpdateDto dto)
    {
        var entity = await _db.PetCareArticles.FirstOrDefaultAsync(x => x.Id == id);
        if (entity is null) return ApiResponse<ArticleGetDto>.Fail("Məqalə tapılmadı.");

        if (!isAdmin && !await _db.VeterinarianProfiles
                .AnyAsync(v => v.Id == entity.VeterinarianProfileId && v.AppUserId == userId))
            return ApiResponse<ArticleGetDto>.Fail("İcazəniz yoxdur.");

        if (entity.Title != dto.Title)
            entity.Slug = await MakeUniqueSlugAsync(dto.Title, entity.Id);

        entity.Title = dto.Title;
        entity.ShortDescription = dto.ShortDescription;
        entity.Content = dto.Content;
        entity.ImageUrl = dto.ImageUrl;
        entity.CategoryId = dto.CategoryId;
        entity.IsPublished = dto.IsPublished;

        await _db.SaveChangesAsync();

        var result = await _db.PetCareArticles.Where(x => x.Id == id)
            .ProjectTo<ArticleGetDto>(_mapper.ConfigurationProvider).FirstAsync();

        return ApiResponse<ArticleGetDto>.Ok(result, "Məqalə yeniləndi.");
    }

    public async Task<ApiResponse<string>> DeleteAsync(int userId, bool isAdmin, int id)
    {
        var entity = await _db.PetCareArticles.FirstOrDefaultAsync(x => x.Id == id);
        if (entity is null) return ApiResponse<string>.Fail("Məqalə tapılmadı.");

        if (!isAdmin && !await _db.VeterinarianProfiles
                .AnyAsync(v => v.Id == entity.VeterinarianProfileId && v.AppUserId == userId))
            return ApiResponse<string>.Fail("İcazəniz yoxdur.");

        entity.IsDeleted = true;
        entity.IsPublished = false;
        await _db.SaveChangesAsync();

        return ApiResponse<string>.Ok("ok", "Məqalə silindi.");
    }

    private async Task<string> MakeUniqueSlugAsync(string title, int? excludeId = null)
    {
        var baseSlug = FormatHelpers.Slugify(title);
        var slug = baseSlug;
        var i = 1;

        while (await _db.PetCareArticles.IgnoreQueryFilters()
                   .AnyAsync(x => x.Slug == slug && (excludeId == null || x.Id != excludeId)))
        {
            slug = $"{baseSlug}-{i++}";
        }
        return slug;
    }
}