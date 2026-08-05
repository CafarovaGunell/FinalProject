
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using ViViPaw.Data;
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.Vet;
using ViViPaw.Helpers;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Vet;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Services;

public class AppointmentService : IAppointmentService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;
    private readonly INotificationService _notify;

    public AppointmentService(AppDbContext db, IMapper mapper, INotificationService notify)
    {
        _db = db;
        _mapper = mapper;
        _notify = notify;
    }

    public async Task<ApiResponse<List<AvailableSlotDto>>> GetAvailableSlotsAsync(
        int vetProfileId, DateTime date, int serviceId)
    {
        var vet = await _db.VeterinarianProfiles
            .FirstOrDefaultAsync(x => x.Id == vetProfileId && x.ApprovalStatus == ApprovalStatus.Approved);
        if (vet is null)
            return ApiResponse<List<AvailableSlotDto>>.Fail("Baytar tapılmadı və ya təsdiqlənməyib.");

        var service = await _db.VetServices
            .FirstOrDefaultAsync(x => x.Id == serviceId && x.VeterinarianProfileId == vetProfileId && x.IsActive);
        if (service is null)
            return ApiResponse<List<AvailableSlotDto>>.Fail("Xidmət tapılmadı.");

        var day = date.Date;
        if (day < DateTime.Now.Date)
            return ApiResponse<List<AvailableSlotDto>>.Fail("Keçmiş tarix seçilə bilməz.");

        if (day > DateTime.Now.Date.AddDays(60))
            return ApiResponse<List<AvailableSlotDto>>.Fail("Ən çox 60 gün irəli randevu yazıla bilər.");

        //  O günün qrafiki varmı?
        var schedule = await _db.VetSchedules.FirstOrDefaultAsync(x =>
            x.VeterinarianProfileId == vetProfileId &&
            x.DayOfWeek == day.DayOfWeek &&
            x.IsActive);

        if (schedule is null)
            return ApiResponse<List<AvailableSlotDto>>.Ok(new(), "Bu gün baytar işləmir.");

        // 2) Məzuniyyət?
        var isOff = await _db.VetTimeOffs.AnyAsync(x =>
            x.VeterinarianProfileId == vetProfileId &&
            x.StartDate.Date <= day && x.EndDate.Date >= day);

        if (isOff)
            return ApiResponse<List<AvailableSlotDto>>.Ok(new(), "Baytar bu tarixdə məzuniyyətdədir.");

        // 3) Dolu randevular
        var dayEnd = day.AddDays(1);
        var booked = await _db.VetAppointments
            .Where(x => x.VeterinarianProfileId == vetProfileId
                     && x.StartTime >= day && x.StartTime < dayEnd
                     && (x.Status == AppointmentStatus.Pending || x.Status == AppointmentStatus.Confirmed))
            .Select(x => new { x.StartTime, x.EndTime })
            .ToListAsync();

      
        var slots = new List<AvailableSlotDto>();
        var step = schedule.SlotDurationMinutes <= 0 ? 30 : schedule.SlotDurationMinutes;
        var duration = service.DurationMinutes <= 0 ? 30 : service.DurationMinutes;

        var cursor = day.Add(schedule.StartTime.ToTimeSpan());
        var closing = day.Add(schedule.EndTime.ToTimeSpan());

        DateTime? breakStart = schedule.BreakStart.HasValue ? day.Add(schedule.BreakStart.Value.ToTimeSpan()) : null;
        DateTime? breakEnd = schedule.BreakEnd.HasValue ? day.Add(schedule.BreakEnd.Value.ToTimeSpan()) : null;

        var now = DateTime.Now;

        while (cursor.AddMinutes(duration) <= closing)
        {
            var slotEnd = cursor.AddMinutes(duration);
            var ok = true;

            // keçmiş saat
            if (cursor <= now) ok = false;

            // fasilə ilə kəsişir?
            if (ok && breakStart.HasValue && breakEnd.HasValue &&
                cursor < breakEnd.Value && slotEnd > breakStart.Value) ok = false;

            // dolu randevu ilə kəsişir?
            if (ok && booked.Any(b => cursor < b.EndTime && slotEnd > b.StartTime)) ok = false;

            if (ok)
                slots.Add(new AvailableSlotDto
                {
                    StartTime = cursor,
                    EndTime = slotEnd,
                    DisplayText = $"{cursor:HH:mm} - {slotEnd:HH:mm}"
                });

            cursor = cursor.AddMinutes(step);
        }

        return ApiResponse<List<AvailableSlotDto>>.Ok(slots,
            slots.Any() ? $"{slots.Count} boş vaxt tapıldı." : "Bu tarixdə boş vaxt yoxdur.");
    }

    //RANDEVU YARAT 
    public async Task<ApiResponse<AppointmentGetDto>> CreateAsync(int userId, AppointmentCreateDto dto)
    {
        var vet = await _db.VeterinarianProfiles
            .FirstOrDefaultAsync(x => x.Id == dto.VeterinarianProfileId && x.ApprovalStatus == ApprovalStatus.Approved);
        if (vet is null) return ApiResponse<AppointmentGetDto>.Fail("Baytar tapılmadı.");

        if (vet.AppUserId == userId)
            return ApiResponse<AppointmentGetDto>.Fail("Özünüzə randevu yaza bilməzsiniz.");

        var service = await _db.VetServices.FirstOrDefaultAsync(x =>
            x.Id == dto.VetServiceId && x.VeterinarianProfileId == vet.Id && x.IsActive);
        if (service is null) return ApiResponse<AppointmentGetDto>.Fail("Xidmət tapılmadı.");

        // Slot hələ də boşdurmu?
        var slotCheck = await GetAvailableSlotsAsync(vet.Id, dto.StartTime.Date, service.Id);
        if (!slotCheck.Success)
            return ApiResponse<AppointmentGetDto>.Fail(slotCheck.Message);

        var isFree = slotCheck.Data!.Any(s => s.StartTime == dto.StartTime);
        if (!isFree)
            return ApiResponse<AppointmentGetDto>.Fail("Seçdiyiniz vaxt artıq tutulub. Zəhmət olmasa başqa vaxt seçin.");

        // Pet yoxlaması
        if (dto.PetId.HasValue && !await _db.Pets.AnyAsync(x => x.Id == dto.PetId))
            return ApiResponse<AppointmentGetDto>.Fail("Heyvan tapılmadı.");

        if (!dto.PetId.HasValue && string.IsNullOrWhiteSpace(dto.PetInfo))
            return ApiResponse<AppointmentGetDto>.Fail("Heyvan seçin və ya məlumatını yazın.");

        // Eyni vaxta öz randevusu varmı?
        var conflict = await _db.VetAppointments.AnyAsync(x =>
            x.CustomerUserId == userId &&
            x.StartTime == dto.StartTime &&
            (x.Status == AppointmentStatus.Pending || x.Status == AppointmentStatus.Confirmed));
        if (conflict)
            return ApiResponse<AppointmentGetDto>.Fail("Bu vaxtda artıq başqa randevunuz var.");

        var appointment = new VetAppointment
        {
            VeterinarianProfileId = vet.Id,
            CustomerUserId = userId,
            VetServiceId = service.Id,
            PetId = dto.PetId,
            PetInfo = dto.PetInfo,
            ClientPhone = dto.ClientPhone,
            StartTime = dto.StartTime,
            EndTime = dto.StartTime.AddMinutes(service.DurationMinutes),
            PriceSnapshot = service.Price,
            Notes = dto.Notes,
            Status = AppointmentStatus.Pending
        };

        _db.VetAppointments.Add(appointment);
        await _db.SaveChangesAsync();

        await _notify.CreateAsync(vet.AppUserId, "Yeni randevu",
            $"{appointment.StartTime:dd.MM.yyyy HH:mm} — {service.Name}",
            NotificationType.AppointmentCreated, $"/vet/appointments/{appointment.Id}");

        var result = await _db.VetAppointments.Where(x => x.Id == appointment.Id)
            .ProjectTo<AppointmentGetDto>(_mapper.ConfigurationProvider).FirstAsync();

        return ApiResponse<AppointmentGetDto>.Ok(result, "Randevunuz qeydə alındı. Baytar təsdiqi gözlənilir.");
    }

    //SİYAHILAR
    public async Task<ApiResponse<List<AppointmentGetDto>>> GetMyAppointmentsAsync(int userId, AppointmentStatus? status)
    {
        var q = _db.VetAppointments.Where(x => x.CustomerUserId == userId);
        if (status.HasValue) q = q.Where(x => x.Status == status);

        var list = await q.OrderByDescending(x => x.StartTime)
            .ProjectTo<AppointmentGetDto>(_mapper.ConfigurationProvider).ToListAsync();

        return ApiResponse<List<AppointmentGetDto>>.Ok(list);
    }

    public async Task<ApiResponse<List<AppointmentGetDto>>> GetVetAppointmentsAsync(
        int userId, AppointmentStatus? status, DateTime? date)
    {
        var vetId = await _db.VeterinarianProfiles.Where(x => x.AppUserId == userId)
            .Select(x => (int?)x.Id).FirstOrDefaultAsync();
        if (vetId is null) return ApiResponse<List<AppointmentGetDto>>.Fail("Baytar profiliniz yoxdur.");

        var q = _db.VetAppointments.Where(x => x.VeterinarianProfileId == vetId);
        if (status.HasValue) q = q.Where(x => x.Status == status);
        if (date.HasValue)
        {
            var d = date.Value.Date;
            q = q.Where(x => x.StartTime >= d && x.StartTime < d.AddDays(1));
        }

        var list = await q.OrderBy(x => x.StartTime)
            .ProjectTo<AppointmentGetDto>(_mapper.ConfigurationProvider).ToListAsync();

        return ApiResponse<List<AppointmentGetDto>>.Ok(list);
    }

    public async Task<ApiResponse<AppointmentGetDto>> GetByIdAsync(int userId, bool isAdmin, int id)
    {
        var appt = await _db.VetAppointments.Include(x => x.VeterinarianProfile)
            .FirstOrDefaultAsync(x => x.Id == id);
        if (appt is null) return ApiResponse<AppointmentGetDto>.Fail("Randevu tapılmadı.");

        var allowed = isAdmin
            || appt.CustomerUserId == userId
            || appt.VeterinarianProfile.AppUserId == userId;

        if (!allowed) return ApiResponse<AppointmentGetDto>.Fail("İcazəniz yoxdur.");

        var dto = await _db.VetAppointments.Where(x => x.Id == id)
            .ProjectTo<AppointmentGetDto>(_mapper.ConfigurationProvider).FirstAsync();

        return ApiResponse<AppointmentGetDto>.Ok(dto);
    }

    //STATUS (baytar)
    public async Task<ApiResponse<string>> ChangeStatusAsync(int userId, int id, AppointmentStatus status, string? reason)
    {
        var appt = await _db.VetAppointments
            .Include(x => x.VeterinarianProfile)
            .Include(x => x.VetService)
            .FirstOrDefaultAsync(x => x.Id == id);
        if (appt is null) return ApiResponse<string>.Fail("Randevu tapılmadı.");

        if (appt.VeterinarianProfile.AppUserId != userId)
            return ApiResponse<string>.Fail("İcazəniz yoxdur.");

        if (appt.Status is AppointmentStatus.Completed or AppointmentStatus.Cancelled)
            return ApiResponse<string>.Fail("Bu randevunun statusu artıq dəyişdirilə bilməz.");

        if (status == AppointmentStatus.Cancelled && string.IsNullOrWhiteSpace(reason))
            return ApiResponse<string>.Fail("Ləğv səbəbi qeyd olunmalıdır.");

        appt.Status = status;
        if (status == AppointmentStatus.Cancelled) appt.CancelReason = reason;

        await _db.SaveChangesAsync();

        await _notify.CreateAsync(appt.CustomerUserId, "Randevu statusu",
            $"{appt.StartTime:dd.MM.yyyy HH:mm} — {FormatHelpers.AppointmentStatusText(status)}" +
            (status == AppointmentStatus.Cancelled ? $" ({reason})" : ""),
            NotificationType.AppointmentStatusChanged, "/my-appointments");

        return ApiResponse<string>.Ok("ok", "Status yeniləndi.");
    }

    // LƏĞV (müştəri) 
    public async Task<ApiResponse<string>> CancelByCustomerAsync(int userId, int id, string? reason)
    {
        var appt = await _db.VetAppointments.Include(x => x.VeterinarianProfile)
            .FirstOrDefaultAsync(x => x.Id == id && x.CustomerUserId == userId);
        if (appt is null) return ApiResponse<string>.Fail("Randevu tapılmadı.");

        if (appt.Status is not (AppointmentStatus.Pending or AppointmentStatus.Confirmed))
            return ApiResponse<string>.Fail("Bu randevu ləğv edilə bilməz.");

        if (appt.StartTime <= DateTime.Now.AddHours(2))
            return ApiResponse<string>.Fail("Randevuya 2 saatdan az qalıb, ləğv edilə bilməz.");

        appt.Status = AppointmentStatus.Cancelled;
        appt.CancelReason = reason ?? "Müştəri tərəfindən ləğv edildi.";
        await _db.SaveChangesAsync();

        await _notify.CreateAsync(appt.VeterinarianProfile.AppUserId, "Randevu ləğv edildi",
            $"{appt.StartTime:dd.MM.yyyy HH:mm} tarixli randevu müştəri tərəfindən ləğv edildi.",
            NotificationType.AppointmentStatusChanged, "/vet/appointments");

        return ApiResponse<string>.Ok("ok", "Randevu ləğv edildi.");
    }
}