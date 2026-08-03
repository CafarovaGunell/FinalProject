using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using System.Collections;
using System.Linq.Expressions;
using ViViPaw.Data;
using ViViPaw.DTOs.Admin;
using ViViPaw.DTOs.Common;
using ViViPaw.Helpers;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Identity;
using ViViPaw.Services.Interfaces;
using System.Text.Json;

namespace ViViPaw.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.AdminOrSuper)]
public class AdminController : ControllerBase
{
    private readonly IPetShopService _shop;
    private readonly IVetProfileService _vet;
    private readonly IPetService _pet;
    private readonly IOrderService _order;
    private readonly ITestimonialService _testimonial;
    private readonly IUserProfileService _user;
    private readonly AppDbContext _db;
    private readonly UserManager<AppUser> _userManager;

    public AdminController(
        IPetShopService shop,
        IVetProfileService vet,
        IPetService pet,
        IOrderService order,
        ITestimonialService testimonial,
        IUserProfileService user,
        AppDbContext db,
        UserManager<AppUser> userManager)
    {
        _shop = shop;
        _vet = vet;
        _pet = pet;
        _order = order;
        _testimonial = testimonial;
        _user = user;
        _db = db;
        _userManager = userManager;
    }

    // ---------- DASHBOARD ----------
    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var roleIds = await _db.Roles.ToDictionaryAsync(r => r.Name!, r => r.Id);

        async Task<int> CountRole(string role) =>
            roleIds.TryGetValue(role, out var id)
                ? await _db.UserRoles.CountAsync(ur => ur.RoleId == id)
                : 0;

        var d = new DashboardDto
        {
            TotalUsers = await _db.Users.CountAsync(),
            TotalCustomers = await CountRole(Roles.Customer),
            TotalPetShops = await CountRole(Roles.PetShop),
            TotalVets = await CountRole(Roles.Veterinarian),

            PendingShops = await _db.PetShops.CountAsync(x => x.ApprovalStatus == ApprovalStatus.Pending),
            PendingVets = await _db.VeterinarianProfiles.CountAsync(x => x.ApprovalStatus == ApprovalStatus.Pending),
            PendingPets = await _db.Pets.CountAsync(x => !x.IsApproved),
            PendingTestimonials = await _db.Testimonials.CountAsync(x => !x.IsApproved),

            TotalPets = await _db.Pets.CountAsync(),
            AvailablePets = await _db.Pets.CountAsync(x =>
                x.AdoptionStatus == AdoptionStatus.Available && x.IsApproved),
            AdoptedPets = await _db.Pets.CountAsync(x => x.AdoptionStatus == AdoptionStatus.Adopted),
            TotalAdoptionRequests = await _db.AdoptionRequests.CountAsync(),

            TotalProducts = await _db.Products.CountAsync(),
            TotalOrders = await _db.Orders.CountAsync(),
            PendingOrders = await _db.Orders.CountAsync(x => x.Status == OrderStatus.Pending),
            TotalRevenue = await _db.Orders
                .Where(x => x.Status == OrderStatus.Delivered)
                .SumAsync(x => (decimal?)x.TotalAmount) ?? 0,

            TotalAppointments = await _db.VetAppointments.CountAsync(),
            UpcomingAppointments = await _db.VetAppointments.CountAsync(x =>
                x.StartTime > DateTime.Now &&
                (x.Status == AppointmentStatus.Pending || x.Status == AppointmentStatus.Confirmed)),

            TotalArticles = await _db.PetCareArticles.CountAsync(x => x.IsPublished)
        };

        var from = DateTime.UtcNow.AddMonths(-5).Date;

        d.MonthlyOrders = await _db.Orders
            .Where(x => x.CreatedAt >= from)
            .GroupBy(x => new { x.CreatedAt.Year, x.CreatedAt.Month })
            .Select(g => new MonthlyStatDto
            {
                Month = g.Key.Year + "-" + g.Key.Month.ToString("D2"),
                Count = g.Count(),
                Total = g.Sum(x => x.TotalAmount)
            })
            .OrderBy(x => x.Month)
            .ToListAsync();

        d.MonthlyAdoptions = await _db.AdoptionRequests
            .Where(x => x.CreatedAt >= from && x.Status == RequestStatus.Approved)
            .GroupBy(x => new { x.CreatedAt.Year, x.CreatedAt.Month })
            .Select(g => new MonthlyStatDto
            {
                Month = g.Key.Year + "-" + g.Key.Month.ToString("D2"),
                Count = g.Count()
            })
            .OrderBy(x => x.Month)
            .ToListAsync();

        return Ok(ApiResponse<DashboardDto>.Ok(d));
    }

    // ---------- SHOPS ----------
    [HttpGet("shops")]
    public async Task<IActionResult> Shops([FromQuery] ApprovalStatus? status)
        => Ok(await _shop.GetAllAsync(status, null));

    [HttpPut("shops/{id:int}/approval")]
    public async Task<IActionResult> ApproveShop(int id, [FromBody] ApprovalDto dto)
    {
        var r = await _shop.ApproveAsync(id, User.GetUserId(), dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }


    // ---------- VETS ----------
    [HttpGet("vets")]
    public async Task<IActionResult> Vets([FromQuery] ApprovalStatus? status)
        => Ok(await _vet.GetAllAsync(status, null, null));

    [HttpPut("vets/{id:int}/approval")]
    public async Task<IActionResult> ApproveVet(int id, [FromBody] ApprovalDto dto)
    {
        var r = await _vet.ApproveAsync(id, User.GetUserId(), dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    // ---------- PETS ----------
    [HttpGet("pets/pending")]
    public async Task<IActionResult> PendingPets([FromQuery] int page = 1, [FromQuery] int pageSize = 12)
        => Ok(await _pet.GetPendingAsync(page, pageSize));

    [HttpPut("pets/{id:int}/approve")]
    public async Task<IActionResult> ApprovePet(int id, [FromQuery] bool approve = true, [FromQuery] string? reason = null)
    {
        var r = await _pet.ApproveAsync(id, approve, reason);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    // ---------- ADOPTED PETS ----------
    [HttpGet("pets/adopted")]
    public async Task<IActionResult> AdoptedPets()
    {
        string? S(object? obj, params string[] names)
        {
            if (obj == null) return null;

            foreach (var name in names)
            {
                var prop = obj.GetType().GetProperty(name);
                var val = prop?.GetValue(obj)?.ToString();

                if (!string.IsNullOrWhiteSpace(val))
                    return val;
            }

            return null;
        }

        int? I(object? obj, params string[] names)
        {
            if (obj == null) return null;

            foreach (var name in names)
            {
                var prop = obj.GetType().GetProperty(name);
                var val = prop?.GetValue(obj);

                if (val is int i)
                    return i;

                if (val != null && int.TryParse(val.ToString(), out var parsed))
                    return parsed;
            }

            return null;
        }

        bool B(object? obj, params string[] names)
        {
            if (obj == null) return false;

            foreach (var name in names)
            {
                var prop = obj.GetType().GetProperty(name);
                var val = prop?.GetValue(obj);

                if (val is bool b)
                    return b;
            }

            return false;
        }

        string AgeText(int months)
        {
            if (months <= 0) return "—";

            var y = months / 12;
            var m = months % 12;

            if (y > 0 && m > 0) return $"{y} yaş {m} ay";
            if (y > 0) return $"{y} yaş";
            return $"{m} ay";
        }

        // 1) Təsdiqlənmiş müraciətlər
        var approvedRequests = await _db.AdoptionRequests
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(x => x.Status == RequestStatus.Approved)
            .OrderByDescending(x => x.UpdatedAt)
            .ToListAsync();

        var approvedPetIds = approvedRequests
            .Select(x => x.PetId)
            .Distinct()
            .ToList();

        var reqByPet = approvedRequests
            .GroupBy(x => x.PetId)
            .ToDictionary(
                g => g.Key,
                g => g.OrderByDescending(x => x.UpdatedAt).First()
            );

        // 2) Heç bir navigation Include etmirik.
        // Category / OwnerUser / PetShop modeldə navigation olmaya bilər.
        var pets = await _db.Pets
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(p =>
                p.AdoptionStatus == AdoptionStatus.Adopted ||
                approvedPetIds.Contains(p.Id))
            .OrderByDescending(p => p.UpdatedAt)
            .ToListAsync();

        var petIds = pets
            .Select(p => p.Id)
            .Distinct()
            .ToList();

        // 3) Şəkillər ayrıca götürülür
        var petImages = await _db.PetImages
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(i => petIds.Contains(i.PetId))
            .ToListAsync();

        var imagesByPet = petImages
            .Cast<object>()
            .GroupBy(img => I(img, "PetId") ?? 0)
            .Where(g => g.Key != 0)
            .ToDictionary(g => g.Key, g => g.ToList());

        // 4) Kateqoriyalar ayrıca götürülür
        var categoryIds = pets
            .Select(p => I(p, "CategoryId"))
            .Where(x => x.HasValue)
            .Select(x => x!.Value)
            .Distinct()
            .ToList();

        var categoryNames = await _db.Categories
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(c => categoryIds.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, c => c.Name);

        // 5) PetShop-lar ayrıca götürülür
        var petShopIds = pets
            .Select(p => I(p, "PetShopId"))
            .Where(x => x.HasValue)
            .Select(x => x!.Value)
            .Distinct()
            .ToList();

        var shops = await _db.PetShops
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(s => petShopIds.Contains(s.Id))
            .ToDictionaryAsync(s => s.Id, s => (object)s);

        // 6) Yeni sahib: AdoptionRequests cədvəlində ApplicantUserId-dir
        var applicantIds = approvedRequests
            .Select(r => I(r, "ApplicantUserId", "UserId", "CustomerUserId", "AdopterUserId"))
            .Where(x => x.HasValue)
            .Select(x => x!.Value)
            .Distinct()
            .ToList();

        // 7) Əvvəlki sahib: Pets-də OwnerUserId ola bilər
        var previousOwnerIds = pets
            .Select(p => I(p, "OwnerUserId", "UserId"))
            .Where(x => x.HasValue)
            .Select(x => x!.Value)
            .Distinct()
            .ToList();

        var userIds = applicantIds
            .Concat(previousOwnerIds)
            .Distinct()
            .ToList();

        var users = await _db.Users
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id);

        var data = pets.Select(p =>
        {
            reqByPet.TryGetValue(p.Id, out var req);

            var applicantId = I(req, "ApplicantUserId", "UserId", "CustomerUserId", "AdopterUserId");

            AppUser? applicant = null;
            if (applicantId.HasValue)
                users.TryGetValue(applicantId.Value, out applicant);

            var previousOwnerId = I(p, "OwnerUserId", "UserId");

            AppUser? previousOwner = null;
            if (previousOwnerId.HasValue)
                users.TryGetValue(previousOwnerId.Value, out previousOwner);

            var categoryId = I(p, "CategoryId");

            string? categoryName = null;
            if (categoryId.HasValue)
                categoryNames.TryGetValue(categoryId.Value, out categoryName);

            var petShopId = I(p, "PetShopId");

            object? shop = null;
            if (petShopId.HasValue && shops.TryGetValue(petShopId.Value, out var shopObj))
                shop = shopObj;

            var imageObjects = imagesByPet.TryGetValue(p.Id, out var imgs)
                ? imgs
                : new List<object>();

            var imageItems = imageObjects
                .Select(img => new
                {
                    Url = S(img, "ImageUrl", "Url", "Path"),
                    IsMain = B(img, "IsMain")
                })
                .Where(x => !string.IsNullOrWhiteSpace(x.Url))
                .OrderByDescending(x => x.IsMain)
                .ToList();

            return new
            {
                id = p.Id,
                petId = p.Id,

                requestId = req?.Id,
                requestCreatedAt = req?.CreatedAt,
                adoptedAt = req?.UpdatedAt ?? p.UpdatedAt,

                name = p.Name,
                breed = p.Breed,

                gender = (int)p.Gender,
                genderText = p.Gender.ToString(),

                ageInMonths = p.AgeInMonths,
                ageText = AgeText(p.AgeInMonths),

                size = (int)p.Size,
                sizeText = p.Size.ToString(),

                color = p.Color,
                description = p.Description,
                healthNotes = p.HealthNotes,

                isVaccinated = p.IsVaccinated,
                isNeutered = p.IsNeutered,

                categoryId = categoryId,
                categoryName = categoryName,

                city = p.City,
                address = p.Address,
                contactPhone = p.ContactPhone,
                reasonToGiveAway = p.ReasonToGiveAway,

                adoptionStatus = (int)p.AdoptionStatus,
                adoptionStatusText = p.AdoptionStatus.ToString(),

                ownerType = (int)p.OwnerType,
                ownerTypeText = p.OwnerType.ToString(),

                mainImageUrl = imageItems.Select(x => x.Url).FirstOrDefault(),
                imageUrls = imageItems.Select(x => x.Url).ToList(),
                images = imageItems.Select(x => new
                {
                    imageUrl = x.Url,
                    isMain = x.IsMain
                }).ToList(),

                previousOwnerUserId = previousOwnerId,
                previousOwnerFullName = S(previousOwner, "FullName", "UserName", "Email"),
                previousOwnerEmail = S(previousOwner, "Email"),
                previousOwnerPhone = S(previousOwner, "PhoneNumber"),

                petShopId = petShopId,
                petShopName = S(shop, "Name", "ShopName", "BusinessName"),
                petShopPhone = S(shop, "Phone", "PhoneNumber", "ContactPhone"),
                petShopEmail = S(shop, "Email"),
                petShopAddress = S(shop, "Address"),

                adopterUserId = applicantId,

                // AdoptionRequests-də FullName/Phone/Address var
                adopterFullName = S(req, "FullName") ?? S(applicant, "FullName", "UserName", "Email"),
                adopterEmail = S(applicant, "Email"),
                adopterPhone = S(req, "Phone") ?? S(applicant, "PhoneNumber"),
                adopterCity = S(applicant, "City"),
                adopterAddress = S(req, "Address"),

                requestMessage = S(req, "Reason", "Message", "Note", "ApplicantMessage", "Description"),
                reviewNote = S(req, "ReviewNote"),

                createdAt = p.CreatedAt,
                updatedAt = p.UpdatedAt
            };
        })
        .OrderByDescending(x => x.adoptedAt)
        .ToList();

        return Ok(ApiResponse<object>.Ok(data));
    }



    // ---------- ADOPTION REQUESTS ----------
    [HttpGet("adoption-requests")]
    public async Task<IActionResult> AdoptionRequests()
    {
        string? S(object? obj, params string[] names)
        {
            if (obj == null) return null;

            foreach (var name in names)
            {
                var prop = obj.GetType().GetProperty(name);
                var val = prop?.GetValue(obj)?.ToString();

                if (!string.IsNullOrWhiteSpace(val))
                    return val;
            }

            return null;
        }

        int? I(object? obj, params string[] names)
        {
            if (obj == null) return null;

            foreach (var name in names)
            {
                var prop = obj.GetType().GetProperty(name);
                var val = prop?.GetValue(obj);

                if (val is int i) return i;
                if (val != null && int.TryParse(val.ToString(), out var parsed)) return parsed;
            }

            return null;
        }

        var requests = await _db.AdoptionRequests
            .AsNoTracking()
            .IgnoreQueryFilters()
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        var petIds = requests.Select(x => x.PetId).Distinct().ToList();

        var petsList = await _db.Pets
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(p => petIds.Contains(p.Id))
            .ToListAsync();

        var pets = petsList.ToDictionary(p => p.Id, p => (object)p);

        var applicantIds = requests
            .Select(r => I(r, "ApplicantUserId", "UserId", "CustomerUserId", "AdopterUserId"))
            .Where(x => x.HasValue)
            .Select(x => x!.Value)
            .Distinct()
            .ToList();

        var reviewerIds = requests
            .Select(r => I(r, "ReviewedByUserId", "ReviewerUserId"))
            .Where(x => x.HasValue)
            .Select(x => x!.Value)
            .Distinct()
            .ToList();

        var ownerIds = petsList
            .Select(p => I(p, "OwnerUserId", "UserId"))
            .Where(x => x.HasValue)
            .Select(x => x!.Value)
            .Distinct()
            .ToList();

        var userIds = applicantIds
            .Concat(reviewerIds)
            .Concat(ownerIds)
            .Distinct()
            .ToList();

        var users = await _db.Users
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => (object)u);

        var categoryIds = petsList
            .Select(p => I(p, "CategoryId"))
            .Where(x => x.HasValue)
            .Select(x => x!.Value)
            .Distinct()
            .ToList();

        var categories = await _db.Categories
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(c => categoryIds.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, c => (object)c);

        var images = await _db.PetImages
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(i => petIds.Contains(i.PetId))
            .ToListAsync();

        var imagesByPet = images
            .Cast<object>()
            .GroupBy(i => I(i, "PetId") ?? 0)
            .Where(g => g.Key != 0)
            .ToDictionary(g => g.Key, g => g.ToList());

        var data = requests.Select(r =>
        {
            pets.TryGetValue(r.PetId, out var pet);

            var applicantId = I(r, "ApplicantUserId", "UserId", "CustomerUserId", "AdopterUserId");
            object? applicant = null;
            if (applicantId.HasValue)
                users.TryGetValue(applicantId.Value, out applicant);

            var ownerId = I(pet, "OwnerUserId", "UserId");
            object? owner = null;
            if (ownerId.HasValue)
                users.TryGetValue(ownerId.Value, out owner);

            var reviewerId = I(r, "ReviewedByUserId", "ReviewerUserId");
            object? reviewer = null;
            if (reviewerId.HasValue)
                users.TryGetValue(reviewerId.Value, out reviewer);

            var categoryId = I(pet, "CategoryId");
            object? category = null;
            if (categoryId.HasValue)
                categories.TryGetValue(categoryId.Value, out category);

            var imageObjects = imagesByPet.TryGetValue(r.PetId, out var imgs)
                ? imgs
                : new List<object>();

            var mainImage = imageObjects
                .OrderByDescending(i => S(i, "IsMain") == "True")
                .Select(i => S(i, "ImageUrl", "Url", "Path"))
                .FirstOrDefault(x => !string.IsNullOrWhiteSpace(x));

            return new
            {
                id = r.Id,
                requestId = r.Id,

                petId = r.PetId,
                petName = S(pet, "Name"),
                petBreed = S(pet, "Breed"),
                petCategoryName = S(category, "Name"),
                petCity = S(pet, "City"),
                petImageUrl = mainImage,

                applicantUserId = applicantId,
                applicantFullName = S(applicant, "FullName", "UserName", "Email") ?? S(r, "FullName"),
                applicantEmail = S(applicant, "Email"),
                applicantPhone = S(r, "Phone") ?? S(applicant, "PhoneNumber"),
                applicantAddress = S(r, "Address"),
                housingType = S(r, "HousingType"),
                hasOtherPets = S(r, "HasOtherPets"),
                reason = S(r, "Reason"),

                ownerUserId = ownerId,
                ownerFullName = S(owner, "FullName", "UserName", "Email"),
                ownerEmail = S(owner, "Email"),
                ownerPhone = S(owner, "PhoneNumber"),

                status = (int)r.Status,
                statusText = r.Status.ToString(),

                reviewNote = S(r, "ReviewNote"),
                reviewedAt = S(r, "ReviewedAt"),
                reviewedByUserId = reviewerId,
                reviewedByFullName = S(reviewer, "FullName", "UserName", "Email"),

                createdAt = r.CreatedAt,
                updatedAt = r.UpdatedAt
            };
        }).ToList();

        return Ok(ApiResponse<object>.Ok(data));
    }


    // ---------- APPOINTMENTS ----------
    [HttpGet("appointments")]
    public async Task<IActionResult> Appointments([FromQuery] AppointmentStatus? status, [FromQuery] DateTime? date)
    {
        string? S(object? obj, params string[] names)
        {
            if (obj == null) return null;

            foreach (var name in names)
            {
                var prop = obj.GetType().GetProperty(name);
                var val = prop?.GetValue(obj)?.ToString();

                if (!string.IsNullOrWhiteSpace(val))
                    return val;
            }

            return null;
        }

        int? I(object? obj, params string[] names)
        {
            if (obj == null) return null;

            foreach (var name in names)
            {
                var prop = obj.GetType().GetProperty(name);
                var val = prop?.GetValue(obj);

                if (val is int i) return i;
                if (val != null && int.TryParse(val.ToString(), out var parsed)) return parsed;
            }

            return null;
        }

        decimal M(object? obj, params string[] names)
        {
            if (obj == null) return 0;

            foreach (var name in names)
            {
                var prop = obj.GetType().GetProperty(name);
                var val = prop?.GetValue(obj);

                if (val is decimal d) return d;
                if (val != null && decimal.TryParse(val.ToString(), out var parsed)) return parsed;
            }

            return 0;
        }

        var query = _db.VetAppointments
            .AsNoTracking()
            .IgnoreQueryFilters()
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(x => x.Status == status.Value);

        if (date.HasValue)
        {
            var start = date.Value.Date;
            var end = start.AddDays(1);

            query = query.Where(x => x.StartTime >= start && x.StartTime < end);
        }

        var appointments = await query
            .OrderByDescending(x => x.StartTime)
            .ToListAsync();

        var customerIds = appointments
            .Select(a => I(a, "UserId", "CustomerUserId", "CustomerId", "ApplicantUserId"))
            .Where(x => x.HasValue)
            .Select(x => x!.Value)
            .Distinct()
            .ToList();

        var vetProfileIds = appointments
            .Select(a => I(a, "VeterinarianProfileId", "VetProfileId"))
            .Where(x => x.HasValue)
            .Select(x => x!.Value)
            .Distinct()
            .ToList();

        var serviceIds = appointments
            .Select(a => I(a, "VetServiceId", "ServiceId"))
            .Where(x => x.HasValue)
            .Select(x => x!.Value)
            .Distinct()
            .ToList();

        var petIds = appointments
            .Select(a => I(a, "PetId"))
            .Where(x => x.HasValue)
            .Select(x => x!.Value)
            .Distinct()
            .ToList();

        var vetProfiles = await _db.VeterinarianProfiles
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(v => vetProfileIds.Contains(v.Id))
            .ToDictionaryAsync(v => v.Id, v => (object)v);

        var vetUserIds = vetProfiles.Values
            .Select(v => I(v, "UserId", "VeterinarianUserId"))
            .Where(x => x.HasValue)
            .Select(x => x!.Value)
            .Distinct()
            .ToList();

        var userIds = customerIds
            .Concat(vetUserIds)
            .Distinct()
            .ToList();

        var users = await _db.Users
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => (object)u);

        var services = await _db.VetServices
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(s => serviceIds.Contains(s.Id))
            .ToDictionaryAsync(s => s.Id, s => (object)s);

        var pets = await _db.Pets
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(p => petIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => (object)p);

        var data = appointments.Select(a =>
        {
            var customerId = I(a, "UserId", "CustomerUserId", "CustomerId", "ApplicantUserId");
            object? customer = null;
            if (customerId.HasValue)
                users.TryGetValue(customerId.Value, out customer);

            var vetProfileId = I(a, "VeterinarianProfileId", "VetProfileId");
            object? vetProfile = null;
            if (vetProfileId.HasValue)
                vetProfiles.TryGetValue(vetProfileId.Value, out vetProfile);

            var vetUserId = I(vetProfile, "UserId", "VeterinarianUserId");
            object? vetUser = null;
            if (vetUserId.HasValue)
                users.TryGetValue(vetUserId.Value, out vetUser);

            var serviceId = I(a, "VetServiceId", "ServiceId");
            object? service = null;
            if (serviceId.HasValue)
                services.TryGetValue(serviceId.Value, out service);

            var petId = I(a, "PetId");
            object? pet = null;
            if (petId.HasValue)
                pets.TryGetValue(petId.Value, out pet);

            var price = M(a, "PriceSnapshot", "Price", "TotalPrice");
            if (price <= 0) price = M(service, "Price");

            return new
            {
                id = a.Id,
                appointmentId = a.Id,

                customerUserId = customerId,
                customerFullName = S(customer, "FullName", "UserName", "Email"),
                customerEmail = S(customer, "Email"),
                customerPhone = S(customer, "PhoneNumber"),

                vetProfileId = vetProfileId,
                veterinarianFullName = S(vetUser, "FullName", "UserName", "Email"),
                veterinarianEmail = S(vetUser, "Email"),
                clinicName = S(vetProfile, "ClinicName", "Name", "BusinessName"),
                clinicPhone = S(vetProfile, "Phone", "PhoneNumber", "ContactPhone"),
                clinicCity = S(vetProfile, "City"),
                clinicAddress = S(vetProfile, "Address"),

                serviceId = serviceId,
                serviceName = S(service, "Name"),
                servicePrice = M(service, "Price"),
                priceSnapshot = price,

                petId = petId,
                petName = S(pet, "Name") ?? S(a, "PetName"),
                petBreed = S(pet, "Breed"),

                startTime = a.StartTime,
                endTime = S(a, "EndTime"),
                status = (int)a.Status,
                statusText = a.Status.ToString(),

                reason = S(a, "Reason", "Note", "Notes", "Description"),
                createdAt = a.CreatedAt,
                updatedAt = a.UpdatedAt
            };
        }).ToList();

        return Ok(ApiResponse<object>.Ok(data));
    }

    // ---------- ORDERS ----------
    [HttpGet("orders")]
    public async Task<IActionResult> Orders([FromQuery] OrderStatus? status)
        => Ok(await _order.GetAllAsync(status));

    // ---------- TESTIMONIALS ----------
    [HttpGet("testimonials/pending")]
    public async Task<IActionResult> PendingTestimonials()
        => Ok(await _testimonial.GetPendingAsync());

    [HttpPut("testimonials/{id:int}/approve")]
    public async Task<IActionResult> ApproveTestimonial(int id, [FromQuery] bool approve = true)
    {
        var r = await _testimonial.ApproveAsync(id, approve);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    // ---------- USERS ----------
    [HttpGet("users")]
    public async Task<IActionResult> Users([FromQuery] string? role, [FromQuery] string? search)
        => Ok(await _user.GetAllAsync(role, search));

    [HttpPut("users/{id:int}/active")]
    public async Task<IActionResult> SetActive(int id, [FromQuery] bool isActive)
    {
        var r = await _user.SetActiveAsync(id, isActive);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    // ---------- USER ROLE ----------
    [HttpPut("users/{id:int}/role")]
    [Authorize(Roles = Roles.SuperAdmin)]
    public async Task<IActionResult> SetRole(int id, [FromBody] SetRoleDto dto)
    {
        if (id == User.GetUserId())
            return BadRequest(ApiResponse<bool>.Fail("Öz rolunuzu dəyişə bilməzsiniz"));

        var allowed = new[]
        {
            Roles.SuperAdmin,
            Roles.Admin,
            Roles.Customer,
            Roles.PetShop,
            Roles.Veterinarian
        };

        if (string.IsNullOrWhiteSpace(dto.Role) || !allowed.Contains(dto.Role))
            return BadRequest(ApiResponse<bool>.Fail("Yanlış rol"));

        var u = await _userManager.FindByIdAsync(id.ToString());
        if (u == null)
            return BadRequest(ApiResponse<bool>.Fail("İstifadəçi tapılmadı"));

        var current = await _userManager.GetRolesAsync(u);

        if (current.Any())
        {
            var remove = await _userManager.RemoveFromRolesAsync(u, current);
            if (!remove.Succeeded)
            {
                return BadRequest(ApiResponse<bool>.Fail(
                    string.Join(", ", remove.Errors.Select(e => e.Description))));
            }
        }

        var add = await _userManager.AddToRoleAsync(u, dto.Role);
        if (!add.Succeeded)
        {
            return BadRequest(ApiResponse<bool>.Fail(
                string.Join(", ", add.Errors.Select(e => e.Description))));
        }

        return Ok(ApiResponse<bool>.Ok(true, $"Rol dəyişdirildi: {dto.Role}"));
    }

    // ---------- USER HARD DELETE ----------
    [HttpDelete("users/{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        if (id == User.GetUserId())
            return BadRequest(ApiResponse<bool>.Fail("Öz hesabınızı silə bilməzsiniz"));

        var u = await _userManager.FindByIdAsync(id.ToString());
        if (u == null)
            return BadRequest(ApiResponse<bool>.Fail("İstifadəçi tapılmadı"));

        if (u.IsActive)
            return BadRequest(ApiResponse<bool>.Fail("Əvvəlcə istifadəçini deaktiv edin"));

        if (await _userManager.IsInRoleAsync(u, Roles.SuperAdmin))
            return BadRequest(ApiResponse<bool>.Fail("SuperAdmin silinə bilməz"));

        var userEntityType = _db.Model.FindEntityType(typeof(AppUser));
        if (userEntityType == null)
            return BadRequest(ApiResponse<bool>.Fail("AppUser entity tipi tapılmadı"));

        await using var tx = await _db.Database.BeginTransactionAsync();

        try
        {
            await DeleteDependentsOfAsync(userEntityType, id, new HashSet<string>());

            _db.Users.Remove(u);
            await _db.SaveChangesAsync();

            await tx.CommitAsync();

            return Ok(ApiResponse<bool>.Ok(true, "İstifadəçi və bütün bağlı məlumatları databazadan silindi"));
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();

            var msg = ex.InnerException?.Message ?? ex.Message;
            return BadRequest(ApiResponse<bool>.Fail("İstifadəçi silinmədi: " + msg));
        }
    }

    // ---------- HARD DELETE HELPERS ----------
    private async Task DeleteDependentsOfAsync(
        IEntityType principalType,
        object? principalKeyValue,
        HashSet<string> stack)
    {
        if (principalKeyValue == null)
            return;

        var marker = $"{principalType.Name}:{principalKeyValue}";
        if (!stack.Add(marker))
            return;

        var foreignKeys = _db.Model.GetEntityTypes()
            .SelectMany(e => e.GetForeignKeys())
            .Where(fk => fk.PrincipalEntityType == principalType)
            .ToList();

        foreach (var fk in foreignKeys)
        {
            if (fk.Properties.Count != 1 || fk.PrincipalKey.Properties.Count != 1)
                continue;

            var dependentType = fk.DeclaringEntityType;

            if (dependentType.IsOwned())
                continue;

            var dependentClrType = dependentType.ClrType;
            var fkProperty = fk.Properties[0];

            var query = GetSetQuery(dependentClrType);
            query = ApplyIgnoreQueryFilters(query, dependentClrType);
            query = WherePropertyEquals(
                query,
                dependentClrType,
                fkProperty.Name,
                fkProperty.ClrType,
                principalKeyValue
            );

            var dependents = await ToObjectListAsync(query, dependentClrType);

            if (dependents.Count == 0)
                continue;

            var dependentPk = dependentType.FindPrimaryKey();

            if (dependentPk != null && dependentPk.Properties.Count == 1)
            {
                var pkProperty = dependentPk.Properties[0];

                foreach (var dependent in dependents)
                {
                    var depKeyValue = GetEntityPropertyValue(dependent, pkProperty);

                    if (depKeyValue != null)
                        await DeleteDependentsOfAsync(dependentType, depKeyValue, stack);
                }
            }

            _db.RemoveRange(dependents);
            await _db.SaveChangesAsync();
        }

        stack.Remove(marker);
    }

    private IQueryable GetSetQuery(Type clrType)
    {
        var setMethod = typeof(DbContext)
            .GetMethods()
            .First(m =>
                m.Name == nameof(DbContext.Set) &&
                m.IsGenericMethodDefinition &&
                m.GetParameters().Length == 0);

        return (IQueryable)setMethod
            .MakeGenericMethod(clrType)
            .Invoke(_db, null)!;
    }

    private static IQueryable ApplyIgnoreQueryFilters(IQueryable query, Type clrType)
    {
        var method = typeof(EntityFrameworkQueryableExtensions)
            .GetMethods()
            .First(m =>
                m.Name == nameof(EntityFrameworkQueryableExtensions.IgnoreQueryFilters) &&
                m.IsGenericMethodDefinition &&
                m.GetParameters().Length == 1);

        return (IQueryable)method
            .MakeGenericMethod(clrType)
            .Invoke(null, new object[] { query })!;
    }

    private static IQueryable WherePropertyEquals(
        IQueryable source,
        Type entityClrType,
        string propertyName,
        Type propertyType,
        object? value)
    {
        var parameter = Expression.Parameter(entityClrType, "e");

        var left = Expression.Call(
            typeof(EF),
            nameof(EF.Property),
            new[] { propertyType },
            parameter,
            Expression.Constant(propertyName)
        );

        Expression right;

        if (value == null)
        {
            right = Expression.Constant(null, propertyType);
        }
        else
        {
            var nonNullableType = Nullable.GetUnderlyingType(propertyType) ?? propertyType;
            var convertedValue = Convert.ChangeType(value, nonNullableType);

            right = Expression.Constant(convertedValue, nonNullableType);

            if (right.Type != propertyType)
                right = Expression.Convert(right, propertyType);
        }

        var body = Expression.Equal(left, right);

        var lambdaType = typeof(Func<,>).MakeGenericType(entityClrType, typeof(bool));
        var lambda = Expression.Lambda(lambdaType, body, parameter);

        var whereCall = Expression.Call(
            typeof(Queryable),
            nameof(Queryable.Where),
            new[] { entityClrType },
            source.Expression,
            Expression.Quote(lambda)
        );

        return source.Provider.CreateQuery(whereCall);
    }

    private static async Task<List<object>> ToObjectListAsync(IQueryable query, Type clrType)
    {
        var method = typeof(EntityFrameworkQueryableExtensions)
            .GetMethods()
            .First(m =>
                m.Name == nameof(EntityFrameworkQueryableExtensions.ToListAsync) &&
                m.IsGenericMethodDefinition &&
                m.GetParameters().Length == 2);

        var task = (Task)method
            .MakeGenericMethod(clrType)
            .Invoke(null, new object[] { query, CancellationToken.None })!;

        await task.ConfigureAwait(false);

        var result = task.GetType().GetProperty("Result")!.GetValue(task)!;

        return ((IEnumerable)result).Cast<object>().ToList();
    }

    private static object? GetEntityPropertyValue(object entity, IProperty property)
    {
        if (property.PropertyInfo != null)
            return property.PropertyInfo.GetValue(entity);

        if (property.FieldInfo != null)
            return property.FieldInfo.GetValue(entity);

        return null;
    }
}