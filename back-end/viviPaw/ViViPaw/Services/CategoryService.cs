// Services/CategoryService.cs
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using ViViPaw.Data;
using ViViPaw.DTOs.Category;
using ViViPaw.DTOs.Common;
using ViViPaw.Models.Common;
using ViViPaw.Models.Enums;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;

    public CategoryService(AppDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<ApiResponse<List<CategoryGetDto>>> GetAllAsync(CategoryType? type)
    {
        var query = _db.Categories.Where(x => x.IsActive);
        if (type.HasValue) query = query.Where(x => x.Type == type.Value);

        var list = await query
            .OrderBy(x => x.Type).ThenBy(x => x.Name)
            .ProjectTo<CategoryGetDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return ApiResponse<List<CategoryGetDto>>.Ok(list);
    }

    public async Task<ApiResponse<CategoryGetDto>> GetByIdAsync(int id)
    {
        var dto = await _db.Categories
            .Where(x => x.Id == id)
            .ProjectTo<CategoryGetDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        return dto is null
            ? ApiResponse<CategoryGetDto>.Fail("Kateqoriya tapılmadı.")
            : ApiResponse<CategoryGetDto>.Ok(dto);
    }

    public async Task<ApiResponse<CategoryGetDto>> CreateAsync(CategoryCreateDto dto)
    {
        var exists = await _db.Categories
            .AnyAsync(x => x.Name.ToLower() == dto.Name.ToLower() && x.Type == dto.Type);
        if (exists)
            return ApiResponse<CategoryGetDto>.Fail("Bu adda kateqoriya artıq mövcuddur.");

        var entity = _mapper.Map<Category>(dto);
        _db.Categories.Add(entity);
        await _db.SaveChangesAsync();

        return ApiResponse<CategoryGetDto>.Ok(_mapper.Map<CategoryGetDto>(entity), "Kateqoriya yaradıldı.");
    }

    public async Task<ApiResponse<CategoryGetDto>> UpdateAsync(int id, CategoryCreateDto dto)
    {
        var entity = await _db.Categories.FindAsync(id);
        if (entity is null) return ApiResponse<CategoryGetDto>.Fail("Kateqoriya tapılmadı.");

        entity.Name = dto.Name;
        entity.Description = dto.Description;
        entity.IconUrl = dto.IconUrl;
        entity.Type = dto.Type;
        entity.ParentCategoryId = dto.ParentCategoryId;

        await _db.SaveChangesAsync();
        return ApiResponse<CategoryGetDto>.Ok(_mapper.Map<CategoryGetDto>(entity), "Yeniləndi.");
    }

    public async Task<ApiResponse<string>> DeleteAsync(int id)
    {
        var entity = await _db.Categories.FindAsync(id);
        if (entity is null) return ApiResponse<string>.Fail("Kateqoriya tapılmadı.");

        var usedByPet = await _db.Pets.AnyAsync(x => x.CategoryId == id);
        var usedByProduct = await _db.Products.AnyAsync(x => x.CategoryId == id || x.TargetAnimalCategoryId == id);
        if (usedByPet || usedByProduct)
            return ApiResponse<string>.Fail("Bu kateqoriya istifadə olunur, silinə bilməz. Deaktiv edin.");

        entity.IsDeleted = true;
        entity.IsActive = false;
        await _db.SaveChangesAsync();

        return ApiResponse<string>.Ok("ok", "Kateqoriya silindi.");
    }
}