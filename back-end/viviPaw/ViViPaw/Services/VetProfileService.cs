
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using ViViPaw.Data;
using ViViPaw.DTOs.Admin;
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.Vet;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Vet;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Services;

public class VetProfileService : IVetProfileService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;
    private readonly INotificationService _notify;

    public VetProfileService(AppDbContext db, IMapper mapper, INotificationService notify)
    {
        _db = db;
        _mapper = mapper;
        _notify = notify;
    }

    public async Task<ApiResponse<VetProfileGetDto>> CreateAsync(int userId, VetProfileCreateDto dto)
    {
        if (await _db.VeterinarianProfiles.IgnoreQueryFilters().AnyAsync(x => x.AppUserId == userId))
            return ApiResponse<VetProfileGetDto>.Fail("Sizin artıq baytar profiliniz var.");

        var vet = _mapper.Map<VeterinarianProfile>(dto);
        vet.AppUserId = userId;
        vet.ApprovalStatus = ApprovalStatus.Pending;

        _db.VeterinarianProfiles.Add(vet);
        await _db.SaveChangesAsync();

        var adminIds = await _db.UserRoles
            .Where(ur => _db.Roles.Any(r => r.Id == ur.RoleId &&
                        (r.Name == Models.Identity.Roles.Admin || r.Name == Models.Identity.Roles.SuperAdmin)))
            .Select(ur => ur.UserId).Distinct().ToListAsync();

        foreach (var adminId in adminIds)
            await _notify.CreateAsync(adminId, "Yeni baytar müraciəti",
                $"'{vet.ClinicName}' klinikası təsdiq gözləyir.",
                NotificationType.System, $"/admin/vets/{vet.Id}");

        return ApiResponse<VetProfileGetDto>.Ok(_mapper.Map<VetProfileGetDto>(vet),
            "Baytar profili yaradıldı. Admin təsdiqi gözlənilir.");
    }

    public async Task<ApiResponse<VetProfileGetDto>> UpdateAsync(int userId, VetProfileUpdateDto dto)
    {
        var vet = await _db.VeterinarianProfiles.FirstOrDefaultAsync(x => x.AppUserId == userId);
        if (vet is null) return ApiResponse<VetProfileGetDto>.Fail("Baytar profili tapılmadı.");

        _mapper.Map(dto, vet);
        await _db.SaveChangesAsync();

        return ApiResponse<VetProfileGetDto>.Ok(_mapper.Map<VetProfileGetDto>(vet), "Yeniləndi.");
    }

    public async Task<ApiResponse<VetProfileGetDto>> GetMyProfileAsync(int userId)
    {
        var dto = await _db.VeterinarianProfiles
            .Where(x => x.AppUserId == userId)
            .ProjectTo<VetProfileGetDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        return dto is null
            ? ApiResponse<VetProfileGetDto>.Fail("Baytar profili tapılmadı.")
            : ApiResponse<VetProfileGetDto>.Ok(dto);
    }

    public async Task<ApiResponse<VetProfileGetDto>> GetByIdAsync(int id)
    {
        var dto = await _db.VeterinarianProfiles
            .Where(x => x.Id == id)
            .ProjectTo<VetProfileGetDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        return dto is null
            ? ApiResponse<VetProfileGetDto>.Fail("Baytar tapılmadı.")
            : ApiResponse<VetProfileGetDto>.Ok(dto);
    }

    public async Task<ApiResponse<List<VetProfileGetDto>>> GetAllAsync(
        ApprovalStatus? status, string? city, string? specialty)
    {
        var q = _db.VeterinarianProfiles.AsQueryable();
        if (status.HasValue) q = q.Where(x => x.ApprovalStatus == status.Value);
        if (!string.IsNullOrWhiteSpace(city)) q = q.Where(x => x.City.Contains(city));
        if (!string.IsNullOrWhiteSpace(specialty)) q = q.Where(x => x.Specialty.Contains(specialty));

        var list = await q
            .OrderByDescending(x => x.ExperienceYears)
            .ProjectTo<VetProfileGetDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return ApiResponse<List<VetProfileGetDto>>.Ok(list);
    }

    public async Task<ApiResponse<string>> ApproveAsync(int vetId, int adminId, ApprovalDto dto)
    {
        var vet = await _db.VeterinarianProfiles.FirstOrDefaultAsync(x => x.Id == vetId);
        if (vet is null) return ApiResponse<string>.Fail("Baytar profili tapılmadı.");

        if (dto.Status == ApprovalStatus.Rejected && string.IsNullOrWhiteSpace(dto.RejectReason))
            return ApiResponse<string>.Fail("Rədd səbəbi qeyd olunmalıdır.");

        vet.ApprovalStatus = dto.Status;
        vet.RejectReason = dto.Status == ApprovalStatus.Rejected ? dto.RejectReason : null;
        vet.ApprovedAt = dto.Status == ApprovalStatus.Approved ? DateTime.UtcNow : null;

        await _db.SaveChangesAsync();

        var msg = dto.Status == ApprovalStatus.Approved
            ? "Baytar hesabınız təsdiqləndi. Xidmət və iş qrafiki əlavə edə bilərsiniz."
            : $"Müraciətiniz rədd edildi. Səbəb: {dto.RejectReason}";

        await _notify.CreateAsync(vet.AppUserId, "Hesab statusu", msg,
            NotificationType.AccountApproved, "/vet/profile");

        return ApiResponse<string>.Ok("ok", "Status yeniləndi.");
    }
}