
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using ViViPaw.Data;
using ViViPaw.DTOs.Adoption;
using ViViPaw.DTOs.Common;
using ViViPaw.Models.Adoption;
using ViViPaw.Models.Enums;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Services;

public class AdoptionRequestService : IAdoptionRequestService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;
    private readonly INotificationService _notify;

    public AdoptionRequestService(AppDbContext db, IMapper mapper, INotificationService notify)
    {
        _db = db;
        _mapper = mapper;
        _notify = notify;
    }

    public async Task<ApiResponse<AdoptionRequestGetDto>> CreateAsync(int userId, AdoptionRequestCreateDto dto)
    {
        var pet = await _db.Pets.FirstOrDefaultAsync(x => x.Id == dto.PetId);
        if (pet is null) return ApiResponse<AdoptionRequestGetDto>.Fail("Heyvan tapılmadı.");
        if (!pet.IsApproved) return ApiResponse<AdoptionRequestGetDto>.Fail("Bu elan hələ təsdiqlənməyib.");
        if (pet.AdoptionStatus == AdoptionStatus.Adopted)
            return ApiResponse<AdoptionRequestGetDto>.Fail("Bu heyvan artıq sahibləndirilib.");

        var ownerId = await GetOwnerUserIdAsync(pet);
        if (ownerId == userId)
            return ApiResponse<AdoptionRequestGetDto>.Fail("Öz elanınıza müraciət edə bilməzsiniz.");

        if (await _db.AdoptionRequests.AnyAsync(x => x.PetId == dto.PetId && x.ApplicantUserId == userId))
            return ApiResponse<AdoptionRequestGetDto>.Fail("Bu heyvana artıq müraciət etmisiniz.");

        var req = _mapper.Map<AdoptionRequest>(dto);
        req.ApplicantUserId = userId;
        req.Status = RequestStatus.Pending;

        _db.AdoptionRequests.Add(req);

        if (pet.AdoptionStatus == AdoptionStatus.Available)
            pet.AdoptionStatus = AdoptionStatus.Pending;

        await _db.SaveChangesAsync();

        await _notify.CreateAsync(ownerId, "Yeni sahiblənmə müraciəti",
            $"'{pet.Name}' üçün {dto.FullName} müraciət etdi.",
            NotificationType.AdoptionRequestReceived, $"/my-pets/{pet.Id}/requests");

        var result = await _db.AdoptionRequests.Where(x => x.Id == req.Id)
            .ProjectTo<AdoptionRequestGetDto>(_mapper.ConfigurationProvider).FirstAsync();

        return ApiResponse<AdoptionRequestGetDto>.Ok(result, "Müraciətiniz göndərildi.");
    }

    ///Mənim göndərdiyim müraciətlər
    public async Task<ApiResponse<List<AdoptionRequestGetDto>>> GetMyRequestsAsync(int userId)
    {
        var list = await _db.AdoptionRequests
            .Where(x => x.ApplicantUserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ProjectTo<AdoptionRequestGetDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return ApiResponse<List<AdoptionRequestGetDto>>.Ok(list);
    }

    ///Mənim elanlarıma gələn müraciətlər
    public async Task<ApiResponse<List<AdoptionRequestGetDto>>> GetReceivedAsync(int userId)
    {
        var shopId = await _db.PetShops.Where(x => x.AppUserId == userId).Select(x => (int?)x.Id).FirstOrDefaultAsync();

        var list = await _db.AdoptionRequests
            .Where(x => shopId != null ? x.Pet.PetShopId == shopId : x.Pet.AppUserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ProjectTo<AdoptionRequestGetDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return ApiResponse<List<AdoptionRequestGetDto>>.Ok(list);
    }

    public async Task<ApiResponse<List<AdoptionRequestGetDto>>> GetByPetAsync(int userId, int petId)
    {
        var pet = await _db.Pets.FirstOrDefaultAsync(x => x.Id == petId);
        if (pet is null) return ApiResponse<List<AdoptionRequestGetDto>>.Fail("Heyvan tapılmadı.");

        if (await GetOwnerUserIdAsync(pet) != userId)
            return ApiResponse<List<AdoptionRequestGetDto>>.Fail("İcazəniz yoxdur.");

        var list = await _db.AdoptionRequests
            .Where(x => x.PetId == petId)
            .OrderByDescending(x => x.CreatedAt)
            .ProjectTo<AdoptionRequestGetDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return ApiResponse<List<AdoptionRequestGetDto>>.Ok(list);
    }

    //TƏSDİQ - RƏDD
    public async Task<ApiResponse<string>> ReviewAsync(int userId, int requestId, AdoptionRequestReviewDto dto)
    {
        var req = await _db.AdoptionRequests.Include(x => x.Pet)
            .FirstOrDefaultAsync(x => x.Id == requestId);
        if (req is null) return ApiResponse<string>.Fail("Müraciət tapılmadı.");

        if (await GetOwnerUserIdAsync(req.Pet) != userId)
            return ApiResponse<string>.Fail("İcazəniz yoxdur.");

        if (req.Status != RequestStatus.Pending)
            return ApiResponse<string>.Fail("Bu müraciət artıq cavablandırılıb.");

        if (dto.Status is not (RequestStatus.Approved or RequestStatus.Rejected))
            return ApiResponse<string>.Fail("Status yalnız Approved (2) və ya Rejected (3) ola bilər.");

        req.Status = dto.Status;
        req.ReviewNote = dto.ReviewNote;
        req.ReviewedAt = DateTime.UtcNow;
        req.ReviewedByUserId = userId;

        if (dto.Status == RequestStatus.Approved)
        {
            req.Pet.AdoptionStatus = AdoptionStatus.Adopted;


            var others = await _db.AdoptionRequests
                .Where(x => x.PetId == req.PetId && x.Id != req.Id && x.Status == RequestStatus.Pending)
                .ToListAsync();

            foreach (var o in others)
            {
                o.Status = RequestStatus.Rejected;
                o.ReviewNote = "Heyvan başqa şəxsə sahibləndirildi.";
                o.ReviewedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync();

            foreach (var o in others)
                await _notify.CreateAsync(o.ApplicantUserId, "Müraciət nəticəsi",
                    $"'{req.Pet.Name}' başqa şəxsə sahibləndirildi.",
                    NotificationType.AdoptionRequestAnswered, "/my-requests");
        }
        else
        {

            var stillPending = await _db.AdoptionRequests
                .AnyAsync(x => x.PetId == req.PetId && x.Id != req.Id && x.Status == RequestStatus.Pending);

            if (!stillPending && req.Pet.AdoptionStatus == AdoptionStatus.Pending)
                req.Pet.AdoptionStatus = AdoptionStatus.Available;

            await _db.SaveChangesAsync();
        }

        var msg = dto.Status == RequestStatus.Approved
            ? $"Təbriklər! '{req.Pet.Name}' üçün müraciətiniz təsdiqləndi."
            : $"'{req.Pet.Name}' üçün müraciətiniz rədd edildi. {dto.ReviewNote}";

        await _notify.CreateAsync(req.ApplicantUserId, "Müraciət nəticəsi", msg,
            NotificationType.AdoptionRequestAnswered, "/my-requests");

        return ApiResponse<string>.Ok("ok", "Müraciət cavablandırıldı.");
    }

    public async Task<ApiResponse<string>> CancelAsync(int userId, int requestId)
    {
        var req = await _db.AdoptionRequests.Include(x => x.Pet)
            .FirstOrDefaultAsync(x => x.Id == requestId && x.ApplicantUserId == userId);
        if (req is null) return ApiResponse<string>.Fail("Müraciət tapılmadı.");

        if (req.Status != RequestStatus.Pending)
            return ApiResponse<string>.Fail("Yalnız gözləyən müraciəti ləğv edə bilərsiniz.");

        req.Status = RequestStatus.Cancelled;

        var stillPending = await _db.AdoptionRequests
            .AnyAsync(x => x.PetId == req.PetId && x.Id != req.Id && x.Status == RequestStatus.Pending);

        if (!stillPending && req.Pet.AdoptionStatus == AdoptionStatus.Pending)
            req.Pet.AdoptionStatus = AdoptionStatus.Available;

        await _db.SaveChangesAsync();
        return ApiResponse<string>.Ok("ok", "Müraciət ləğv edildi.");
    }

    private async Task<int> GetOwnerUserIdAsync(Pet pet)
    {
        if (pet.AppUserId.HasValue) return pet.AppUserId.Value;
        return await _db.PetShops.Where(x => x.Id == pet.PetShopId)
            .Select(x => x.AppUserId).FirstOrDefaultAsync();
    }


    public async Task<ApiResponse<string>> DeleteAsync(int userId, bool isAdmin, int requestId)
    {
        var req = await _db.AdoptionRequests.FirstOrDefaultAsync(x => x.Id == requestId);
        if (req is null) return ApiResponse<string>.Fail("Müraciət tapılmadı.");

        var pet = await _db.Pets.FirstOrDefaultAsync(x => x.Id == req.PetId);

        var isOwner = pet != null && (
            pet.AppUserId == userId ||
            (pet.PetShopId.HasValue && await _db.PetShops.AnyAsync(s => s.Id == pet.PetShopId && s.AppUserId == userId)));

        if (!isAdmin && !isOwner && req.ApplicantUserId != userId)
            return ApiResponse<string>.Fail("Bu müraciəti silməyə icazəniz yoxdur.");

        req.IsDeleted = true;
        await _db.SaveChangesAsync();
        return ApiResponse<string>.Ok("ok", "Müraciət silindi.");
    }
}