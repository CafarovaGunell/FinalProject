// Services/PetShopService.cs
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using ViViPaw.Data;
using ViViPaw.DTOs.Admin;
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.PetShop;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Shop;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Services;

public class PetShopService : IPetShopService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;
    private readonly INotificationService _notify;

    public PetShopService(AppDbContext db, IMapper mapper, INotificationService notify)
    {
        _db = db;
        _mapper = mapper;
        _notify = notify;
    }

    public async Task<ApiResponse<PetShopDetailDto>> CreateAsync(int userId, PetShopCreateDto dto)
    {
        if (await _db.PetShops.IgnoreQueryFilters().AnyAsync(x => x.AppUserId == userId))
            return ApiResponse<PetShopDetailDto>.Fail("Sizin artıq mağaza profiliniz var.");

        if (await _db.PetShops.IgnoreQueryFilters().AnyAsync(x => x.TaxNumber == dto.TaxNumber))
            return ApiResponse<PetShopDetailDto>.Fail("Bu VÖEN artıq qeydiyyatdadır.");

        var shop = _mapper.Map<PetShop>(dto);
        shop.AppUserId = userId;
        shop.ApprovalStatus = ApprovalStatus.Pending;

        _db.PetShops.Add(shop);
        await _db.SaveChangesAsync();

        // Adminlərə bildiriş
        var adminIds = await _db.UserRoles
            .Where(ur => _db.Roles.Any(r => r.Id == ur.RoleId &&
                        (r.Name == Models.Identity.Roles.Admin || r.Name == Models.Identity.Roles.SuperAdmin)))
            .Select(ur => ur.UserId).Distinct().ToListAsync();

        foreach (var adminId in adminIds)
            await _notify.CreateAsync(adminId, "Yeni mağaza müraciəti",
                $"'{shop.Name}' mağazası təsdiq gözləyir.",
                NotificationType.System, $"/admin/shops/{shop.Id}");

        return ApiResponse<PetShopDetailDto>.Ok(_mapper.Map<PetShopDetailDto>(shop),
            "Mağaza profili yaradıldı. Admin təsdiqi gözlənilir.");
    }

    public async Task<ApiResponse<PetShopDetailDto>> UpdateAsync(int userId, PetShopUpdateDto dto)
    {
        var shop = await _db.PetShops.FirstOrDefaultAsync(x => x.AppUserId == userId);
        if (shop is null) return ApiResponse<PetShopDetailDto>.Fail("Mağaza profili tapılmadı.");

        _mapper.Map(dto, shop);
        await _db.SaveChangesAsync();

        return ApiResponse<PetShopDetailDto>.Ok(_mapper.Map<PetShopDetailDto>(shop), "Yeniləndi.");
    }

    public async Task<ApiResponse<PetShopDetailDto>> GetMyShopAsync(int userId)
    {
        var dto = await _db.PetShops
            .Where(x => x.AppUserId == userId)
            .ProjectTo<PetShopDetailDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        return dto is null
            ? ApiResponse<PetShopDetailDto>.Fail("Mağaza profili tapılmadı.")
            : ApiResponse<PetShopDetailDto>.Ok(dto);
    }

    public async Task<ApiResponse<PetShopDetailDto>> GetByIdAsync(int id)
    {
        var dto = await _db.PetShops
            .Where(x => x.Id == id)
            .ProjectTo<PetShopDetailDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        return dto is null
            ? ApiResponse<PetShopDetailDto>.Fail("Mağaza tapılmadı.")
            : ApiResponse<PetShopDetailDto>.Ok(dto);
    }

    public async Task<ApiResponse<List<PetShopGetDto>>> GetAllAsync(ApprovalStatus? status, string? city)
    {
        var q = _db.PetShops.AsQueryable();
        if (status.HasValue) q = q.Where(x => x.ApprovalStatus == status.Value);
        if (!string.IsNullOrWhiteSpace(city)) q = q.Where(x => x.City.Contains(city));

        var list = await q
            .OrderByDescending(x => x.CreatedAt)
            .ProjectTo<PetShopGetDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return ApiResponse<List<PetShopGetDto>>.Ok(list);
    }

    public async Task<ApiResponse<string>> ApproveAsync(int shopId, int adminId, ApprovalDto dto)
    {
        var shop = await _db.PetShops.FirstOrDefaultAsync(x => x.Id == shopId);
        if (shop is null) return ApiResponse<string>.Fail("Mağaza tapılmadı.");

        if (dto.Status == ApprovalStatus.Rejected && string.IsNullOrWhiteSpace(dto.RejectReason))
            return ApiResponse<string>.Fail("Rədd səbəbi qeyd olunmalıdır.");

        shop.ApprovalStatus = dto.Status;
        shop.RejectReason = dto.Status == ApprovalStatus.Rejected ? dto.RejectReason : null;
        shop.ApprovedAt = dto.Status == ApprovalStatus.Approved ? DateTime.UtcNow : null;
        shop.ApprovedByUserId = adminId;

        await _db.SaveChangesAsync();

        var msg = dto.Status == ApprovalStatus.Approved
            ? "Mağaza hesabınız təsdiqləndi. Artıq məhsul və heyvan əlavə edə bilərsiniz."
            : $"Mağaza müraciətiniz rədd edildi. Səbəb: {dto.RejectReason}";

        await _notify.CreateAsync(shop.AppUserId, "Hesab statusu", msg,
            NotificationType.AccountApproved, "/shop/profile");

        return ApiResponse<string>.Ok("ok", "Status yeniləndi.");
    }
}