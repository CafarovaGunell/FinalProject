
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using ViViPaw.Data;
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.WishList;
using ViViPaw.Models.Adoption;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Services;

public class WishListService : IWishListService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;

    public WishListService(AppDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<ApiResponse<List<WishListPetDto>>> GetMyListAsync(int userId)
    {
        var list = await _db.WishLists
            .Where(x => x.AppUserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ProjectTo<WishListPetDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return ApiResponse<List<WishListPetDto>>.Ok(list);
    }

    public async Task<ApiResponse<string>> ToggleAsync(int userId, int petId)
    {
        if (!await _db.Pets.AnyAsync(x => x.Id == petId))
            return ApiResponse<string>.Fail("Heyvan tapılmadı.");

        var existing = await _db.WishLists.FirstOrDefaultAsync(x => x.AppUserId == userId && x.PetId == petId);

        if (existing is not null)
        {
            _db.WishLists.Remove(existing);
            await _db.SaveChangesAsync();
            return ApiResponse<string>.Ok("removed", "Sevimlilərdən çıxarıldı.");
        }

        _db.WishLists.Add(new WishList { AppUserId = userId, PetId = petId });
        await _db.SaveChangesAsync();
        return ApiResponse<string>.Ok("added", "Sevimlilərə əlavə edildi.");
    }

    public async Task<ApiResponse<List<int>>> GetMyPetIdsAsync(int userId)
    {
        var ids = await _db.WishLists.Where(x => x.AppUserId == userId)
            .Select(x => x.PetId).ToListAsync();
        return ApiResponse<List<int>>.Ok(ids);
    }
}