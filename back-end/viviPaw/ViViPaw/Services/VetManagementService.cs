
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using ViViPaw.Data;
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.Vet;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Vet;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Services;

public class VetManagementService : IVetManagementService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;

    public VetManagementService(AppDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    private async Task<VeterinarianProfile?> GetProfileAsync(int userId)
        => await _db.VeterinarianProfiles.FirstOrDefaultAsync(x => x.AppUserId == userId);

    // ================= XİDMƏTLƏR =================
    public async Task<ApiResponse<List<VetServiceGetDto>>> GetServicesAsync(int vetProfileId)
    {
        var list = await _db.VetServices
            .Where(x => x.VeterinarianProfileId == vetProfileId && x.IsActive)
            .OrderBy(x => x.Name)
            .ProjectTo<VetServiceGetDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return ApiResponse<List<VetServiceGetDto>>.Ok(list);
    }

    public async Task<ApiResponse<VetServiceGetDto>> CreateServiceAsync(int userId, VetServiceCreateDto dto)
    {
        var vet = await GetProfileAsync(userId);
        if (vet is null) return ApiResponse<VetServiceGetDto>.Fail("Baytar profiliniz yoxdur.");
        if (vet.ApprovalStatus != ApprovalStatus.Approved)
            return ApiResponse<VetServiceGetDto>.Fail("Profiliniz hələ təsdiqlənməyib.");

        var entity = _mapper.Map<VetService>(dto);
        entity.VeterinarianProfileId = vet.Id;

        _db.VetServices.Add(entity);
        await _db.SaveChangesAsync();

        return ApiResponse<VetServiceGetDto>.Ok(_mapper.Map<VetServiceGetDto>(entity), "Xidmət əlavə edildi.");
    }

    public async Task<ApiResponse<VetServiceGetDto>> UpdateServiceAsync(int userId, int id, VetServiceCreateDto dto)
    {
        var vet = await GetProfileAsync(userId);
        if (vet is null) return ApiResponse<VetServiceGetDto>.Fail("Baytar profiliniz yoxdur.");

        var entity = await _db.VetServices.FirstOrDefaultAsync(x => x.Id == id && x.VeterinarianProfileId == vet.Id);
        if (entity is null) return ApiResponse<VetServiceGetDto>.Fail("Xidmət tapılmadı.");

        entity.Name = dto.Name;
        entity.Description = dto.Description;
        entity.Price = dto.Price;
        entity.DurationMinutes = dto.DurationMinutes;

        await _db.SaveChangesAsync();
        return ApiResponse<VetServiceGetDto>.Ok(_mapper.Map<VetServiceGetDto>(entity), "Yeniləndi.");
    }

    public async Task<ApiResponse<string>> DeleteServiceAsync(int userId, int id)
    {
        var vet = await GetProfileAsync(userId);
        if (vet is null) return ApiResponse<string>.Fail("Baytar profiliniz yoxdur.");

        var entity = await _db.VetServices.FirstOrDefaultAsync(x => x.Id == id && x.VeterinarianProfileId == vet.Id);
        if (entity is null) return ApiResponse<string>.Fail("Xidmət tapılmadı.");

        var hasActive = await _db.VetAppointments.AnyAsync(x =>
            x.VetServiceId == id &&
            (x.Status == AppointmentStatus.Pending || x.Status == AppointmentStatus.Confirmed));

        if (hasActive)
        {
            entity.IsActive = false;   // aktiv randevu var → yalnız gizlət
            await _db.SaveChangesAsync();
            return ApiResponse<string>.Ok("ok", "Xidmət deaktiv edildi (aktiv randevular var).");
        }

        entity.IsDeleted = true;
        entity.IsActive = false;
        await _db.SaveChangesAsync();
        return ApiResponse<string>.Ok("ok", "Xidmət silindi.");
    }

    // ================= QRAFİK =================
    public async Task<ApiResponse<List<VetScheduleGetDto>>> GetSchedulesAsync(int vetProfileId)
    {
        var list = await _db.VetSchedules
            .Where(x => x.VeterinarianProfileId == vetProfileId && x.IsActive)
            .OrderBy(x => x.DayOfWeek)
            .ProjectTo<VetScheduleGetDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return ApiResponse<List<VetScheduleGetDto>>.Ok(list);
    }

    public async Task<ApiResponse<VetScheduleGetDto>> CreateScheduleAsync(int userId, VetScheduleCreateDto dto)
    {
        var vet = await GetProfileAsync(userId);
        if (vet is null) return ApiResponse<VetScheduleGetDto>.Fail("Baytar profiliniz yoxdur.");
        if (vet.ApprovalStatus != ApprovalStatus.Approved)
            return ApiResponse<VetScheduleGetDto>.Fail("Profiliniz hələ təsdiqlənməyib.");

        if (dto.EndTime <= dto.StartTime)
            return ApiResponse<VetScheduleGetDto>.Fail("Bitmə vaxtı başlama vaxtından sonra olmalıdır.");

        if (dto.BreakStart.HasValue != dto.BreakEnd.HasValue)
            return ApiResponse<VetScheduleGetDto>.Fail("Fasilənin həm başlanğıcı, həm sonu qeyd olunmalıdır.");

        if (dto.BreakStart.HasValue && dto.BreakEnd <= dto.BreakStart)
            return ApiResponse<VetScheduleGetDto>.Fail("Fasilə bitmə vaxtı yanlışdır.");

        // Eyni gün varsa → əvəz et
        var existing = await _db.VetSchedules
            .FirstOrDefaultAsync(x => x.VeterinarianProfileId == vet.Id && x.DayOfWeek == dto.DayOfWeek);

        if (existing is not null)
        {
            existing.StartTime = dto.StartTime;
            existing.EndTime = dto.EndTime;
            existing.BreakStart = dto.BreakStart;
            existing.BreakEnd = dto.BreakEnd;
            existing.SlotDurationMinutes = dto.SlotDurationMinutes;
            existing.IsActive = true;

            await _db.SaveChangesAsync();
            return ApiResponse<VetScheduleGetDto>.Ok(_mapper.Map<VetScheduleGetDto>(existing), "Qrafik yeniləndi.");
        }

        var entity = _mapper.Map<VetSchedule>(dto);
        entity.VeterinarianProfileId = vet.Id;

        _db.VetSchedules.Add(entity);
        await _db.SaveChangesAsync();

        return ApiResponse<VetScheduleGetDto>.Ok(_mapper.Map<VetScheduleGetDto>(entity), "Qrafik əlavə edildi.");
    }

    public async Task<ApiResponse<string>> DeleteScheduleAsync(int userId, int id)
    {
        var vet = await GetProfileAsync(userId);
        if (vet is null) return ApiResponse<string>.Fail("Baytar profiliniz yoxdur.");

        var entity = await _db.VetSchedules.FirstOrDefaultAsync(x => x.Id == id && x.VeterinarianProfileId == vet.Id);
        if (entity is null) return ApiResponse<string>.Fail("Qrafik tapılmadı.");

        _db.VetSchedules.Remove(entity);
        await _db.SaveChangesAsync();

        return ApiResponse<string>.Ok("ok", "Qrafik silindi.");
    }

    // ================= MƏZUNİYYƏT =================
    public async Task<ApiResponse<List<VetTimeOffGetDto>>> GetTimeOffsAsync(int userId)
    {
        var vet = await GetProfileAsync(userId);
        if (vet is null) return ApiResponse<List<VetTimeOffGetDto>>.Fail("Baytar profiliniz yoxdur.");

        var list = await _db.VetTimeOffs
            .Where(x => x.VeterinarianProfileId == vet.Id)
            .OrderByDescending(x => x.StartDate)
            .ProjectTo<VetTimeOffGetDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return ApiResponse<List<VetTimeOffGetDto>>.Ok(list);
    }

    public async Task<ApiResponse<VetTimeOffGetDto>> CreateTimeOffAsync(int userId, VetTimeOffCreateDto dto)
    {
        var vet = await GetProfileAsync(userId);
        if (vet is null) return ApiResponse<VetTimeOffGetDto>.Fail("Baytar profiliniz yoxdur.");

        if (dto.EndDate.Date < dto.StartDate.Date)
            return ApiResponse<VetTimeOffGetDto>.Fail("Bitmə tarixi başlama tarixindən əvvəl ola bilməz.");

        var entity = _mapper.Map<VetTimeOff>(dto);
        entity.VeterinarianProfileId = vet.Id;

        _db.VetTimeOffs.Add(entity);
        await _db.SaveChangesAsync();

        return ApiResponse<VetTimeOffGetDto>.Ok(_mapper.Map<VetTimeOffGetDto>(entity), "Məzuniyyət əlavə edildi.");
    }

    public async Task<ApiResponse<string>> DeleteTimeOffAsync(int userId, int id)
    {
        var vet = await GetProfileAsync(userId);
        if (vet is null) return ApiResponse<string>.Fail("Baytar profiliniz yoxdur.");

        var entity = await _db.VetTimeOffs.FirstOrDefaultAsync(x => x.Id == id && x.VeterinarianProfileId == vet.Id);
        if (entity is null) return ApiResponse<string>.Fail("Qeyd tapılmadı.");

        _db.VetTimeOffs.Remove(entity);
        await _db.SaveChangesAsync();

        return ApiResponse<string>.Ok("ok", "Silindi.");
    }
}