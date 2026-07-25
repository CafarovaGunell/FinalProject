
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using ViViPaw.Data;
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.Pet;
using ViViPaw.Models.Adoption;
using ViViPaw.Models.Enums;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Services;

public class PetService : IPetService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;
    private readonly INotificationService _notify;

    public PetService(AppDbContext db, IMapper mapper, INotificationService notify)
    {
        _db = db;
        _mapper = mapper;
        _notify = notify;
    }

    // ---------- SİYAHI (public, filtr + səhifələmə) ----------
    public async Task<ApiResponse<PagedResult<PetGetDto>>> GetAllAsync(PetFilterDto f)
    {
        var q = _db.Pets
            .Include(x => x.Category)
            .Include(x => x.Images)
            .Where(x => x.IsApproved)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(f.Search))
        {
            var s = f.Search.Trim().ToLower();
            q = q.Where(x => x.Name.ToLower().Contains(s)
                          || x.Breed.ToLower().Contains(s)
                          || x.City.ToLower().Contains(s));
        }

        if (f.CategoryId.HasValue) q = q.Where(x => x.CategoryId == f.CategoryId);
        if (!string.IsNullOrWhiteSpace(f.City)) q = q.Where(x => x.City.Contains(f.City));
        if (f.Gender.HasValue) q = q.Where(x => x.Gender == f.Gender);
        if (f.Size.HasValue) q = q.Where(x => x.Size == f.Size);
        if (f.OwnerType.HasValue) q = q.Where(x => x.OwnerType == f.OwnerType);
        if (f.IsVaccinated.HasValue) q = q.Where(x => x.IsVaccinated == f.IsVaccinated);
        if (f.IsNeutered.HasValue) q = q.Where(x => x.IsNeutered == f.IsNeutered);
        if (f.IsUrgent.HasValue) q = q.Where(x => x.IsUrgent == f.IsUrgent);
        if (f.MinAgeInMonths.HasValue) q = q.Where(x => x.AgeInMonths >= f.MinAgeInMonths);
        if (f.MaxAgeInMonths.HasValue) q = q.Where(x => x.AgeInMonths <= f.MaxAgeInMonths);

        q = f.AdoptionStatus.HasValue
            ? q.Where(x => x.AdoptionStatus == f.AdoptionStatus)
            : q.Where(x => x.AdoptionStatus != AdoptionStatus.Inactive);

        q = f.SortBy switch
        {
            "oldest" => q.OrderBy(x => x.CreatedAt),
            "age_asc" => q.OrderBy(x => x.AgeInMonths),
            "age_desc" => q.OrderByDescending(x => x.AgeInMonths),
            _ => q.OrderByDescending(x => x.IsUrgent).ThenByDescending(x => x.CreatedAt)
        };

        var total = await q.CountAsync();
        var page = f.Page < 1 ? 1 : f.Page;
        var size = f.PageSize is < 1 or > 60 ? 12 : f.PageSize;

        var items = await q.Skip((page - 1) * size).Take(size)
            .ProjectTo<PetGetDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return ApiResponse<PagedResult<PetGetDto>>.Ok(new PagedResult<PetGetDto>
        {
            Items = items,
            Page = page,
            PageSize = size,
            TotalCount = total
        });
    }

    // ---------- DETAL ----------
    public async Task<ApiResponse<PetDetailDto>> GetByIdAsync(int id)
    {
        var dto = await _db.Pets
            .Where(x => x.Id == id)
            .ProjectTo<PetDetailDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        return dto is null
            ? ApiResponse<PetDetailDto>.Fail("Heyvan tapılmadı.")
            : ApiResponse<PetDetailDto>.Ok(dto);
    }

    // ---------- YARAT ----------
    public async Task<ApiResponse<PetDetailDto>> CreateAsync(int userId, PetCreateDto dto)
    {
        var category = await _db.Categories
            .FirstOrDefaultAsync(x => x.Id == dto.CategoryId && x.Type == CategoryType.Pet);
        if (category is null)
            return ApiResponse<PetDetailDto>.Fail("Yanlış heyvan kateqoriyası.");

        var pet = _mapper.Map<Pet>(dto);

        // Sahib kimdir?
        var shop = await _db.PetShops.FirstOrDefaultAsync(x => x.AppUserId == userId);
        if (shop is not null)
        {
            if (shop.ApprovalStatus != ApprovalStatus.Approved)
                return ApiResponse<PetDetailDto>.Fail("Mağazanız hələ təsdiqlənməyib.");

            pet.OwnerType = PetOwnerType.PetShop;
            pet.PetShopId = shop.Id;
            pet.AppUserId = null;
            pet.IsApproved = true;                 // mağaza → avtomatik
        }
        else
        {
            pet.OwnerType = PetOwnerType.User;
            pet.AppUserId = userId;
            pet.PetShopId = null;
            pet.IsApproved = false;                // istifadəçi → admin moderasiyası
        }

        pet.AdoptionStatus = AdoptionStatus.Available;

        // Şəkillər
        for (int i = 0; i < dto.ImageUrls.Count; i++)
            pet.Images.Add(new PetImage { ImageUrl = dto.ImageUrls[i], IsMain = i == 0, DisplayOrder = i });

        _db.Pets.Add(pet);
        await _db.SaveChangesAsync();

        var result = await _db.Pets.Where(x => x.Id == pet.Id)
            .ProjectTo<PetDetailDto>(_mapper.ConfigurationProvider).FirstAsync();

        var msg = pet.IsApproved
            ? "Elan dərc olundu."
            : "Elan qeydə alındı. Admin təsdiqindən sonra dərc olunacaq.";

        return ApiResponse<PetDetailDto>.Ok(result, msg);
    }

    // ---------- YENİLƏ ----------
    public async Task<ApiResponse<PetDetailDto>> UpdateAsync(int userId, bool isAdmin, int petId, PetUpdateDto dto)
    {
        var pet = await _db.Pets.Include(x => x.Images).FirstOrDefaultAsync(x => x.Id == petId);
        if (pet is null) return ApiResponse<PetDetailDto>.Fail("Heyvan tapılmadı.");

        if (!isAdmin && !await IsOwnerAsync(pet, userId))
            return ApiResponse<PetDetailDto>.Fail("Bu elanı dəyişməyə icazəniz yoxdur.");

        pet.Name = dto.Name;
        pet.Breed = dto.Breed;
        pet.Gender = dto.Gender;
        pet.AgeInMonths = dto.AgeInMonths;
        pet.Size = dto.Size;
        pet.Color = dto.Color;
        pet.Description = dto.Description;
        pet.IsVaccinated = dto.IsVaccinated;
        pet.IsNeutered = dto.IsNeutered;
        pet.HealthNotes = dto.HealthNotes;
        pet.CategoryId = dto.CategoryId;
        pet.City = dto.City;
        pet.Address = dto.Address;
        pet.ContactPhone = dto.ContactPhone;
        pet.ReasonToGiveAway = dto.ReasonToGiveAway;
        pet.IsUrgent = dto.IsUrgent;

        if (dto.AdoptionStatus.HasValue) pet.AdoptionStatus = dto.AdoptionStatus.Value;

        if (dto.ImageUrls is not null && dto.ImageUrls.Any())
        {
            _db.PetImages.RemoveRange(pet.Images);
            for (int i = 0; i < dto.ImageUrls.Count; i++)
                pet.Images.Add(new PetImage { PetId = pet.Id, ImageUrl = dto.ImageUrls[i], IsMain = i == 0, DisplayOrder = i });
        }

        await _db.SaveChangesAsync();

        var result = await _db.Pets.Where(x => x.Id == pet.Id)
            .ProjectTo<PetDetailDto>(_mapper.ConfigurationProvider).FirstAsync();

        return ApiResponse<PetDetailDto>.Ok(result, "Elan yeniləndi.");
    }

    // ---------- SİL (soft) ----------
    public async Task<ApiResponse<string>> DeleteAsync(int userId, bool isAdmin, int petId)
    {
        var pet = await _db.Pets.FirstOrDefaultAsync(x => x.Id == petId);
        if (pet is null) return ApiResponse<string>.Fail("Heyvan tapılmadı.");

        if (!isAdmin && !await IsOwnerAsync(pet, userId))
            return ApiResponse<string>.Fail("Bu elanı silməyə icazəniz yoxdur.");

        pet.IsDeleted = true;
        await _db.SaveChangesAsync();

        return ApiResponse<string>.Ok("ok", "Elan silindi.");
    }

    // ---------- MƏNİM ELANLARIM ----------
    public async Task<ApiResponse<List<PetGetDto>>> GetMyPetsAsync(int userId)
    {
        var shop = await _db.PetShops.FirstOrDefaultAsync(x => x.AppUserId == userId);

        var q = shop is not null
            ? _db.Pets.Where(x => x.PetShopId == shop.Id)
            : _db.Pets.Where(x => x.AppUserId == userId);

        var list = await q.OrderByDescending(x => x.CreatedAt)
            .ProjectTo<PetGetDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return ApiResponse<List<PetGetDto>>.Ok(list);
    }

    // ---------- ADMIN: təsdiq gözləyənlər ----------
    public async Task<ApiResponse<PagedResult<PetGetDto>>> GetPendingAsync(int page, int pageSize)
    {
        var q = _db.Pets.Where(x => !x.IsApproved).OrderBy(x => x.CreatedAt);

        var total = await q.CountAsync();
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 60 ? 12 : pageSize;

        var items = await q.Skip((page - 1) * pageSize).Take(pageSize)
            .ProjectTo<PetGetDto>(_mapper.ConfigurationProvider).ToListAsync();

        return ApiResponse<PagedResult<PetGetDto>>.Ok(new PagedResult<PetGetDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = total
        });
    }

    public async Task<ApiResponse<string>> ApproveAsync(int petId, bool approve, string? reason)
    {
        var pet = await _db.Pets.FirstOrDefaultAsync(x => x.Id == petId);
        if (pet is null) return ApiResponse<string>.Fail("Heyvan tapılmadı.");

        pet.IsApproved = approve;
        if (!approve) pet.AdoptionStatus = AdoptionStatus.Inactive;
        await _db.SaveChangesAsync();

        var ownerId = pet.AppUserId ??
            (await _db.PetShops.Where(s => s.Id == pet.PetShopId).Select(s => s.AppUserId).FirstOrDefaultAsync());

        if (ownerId > 0)
            await _notify.CreateAsync(ownerId, "Elan statusu",
                approve ? $"'{pet.Name}' elanınız təsdiqləndi." : $"'{pet.Name}' elanınız rədd edildi. {reason}",
                NotificationType.System, $"/pets/{pet.Id}");

        return ApiResponse<string>.Ok("ok", approve ? "Elan təsdiqləndi." : "Elan rədd edildi.");
    }

    // ---------- helper ----------
    private async Task<bool> IsOwnerAsync(Pet pet, int userId)
    {
        if (pet.AppUserId == userId) return true;
        if (pet.PetShopId is null) return false;
        return await _db.PetShops.AnyAsync(x => x.Id == pet.PetShopId && x.AppUserId == userId);
    }
}