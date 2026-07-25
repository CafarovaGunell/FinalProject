
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ViViPaw.Data;
using ViViPaw.DTOs.Admin;
using ViViPaw.DTOs.Common;
using ViViPaw.Helpers;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Identity;
using ViViPaw.Services.Interfaces;

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

    public AdminController(
        IPetShopService shop, IVetProfileService vet, IPetService pet,
        IOrderService order, ITestimonialService testimonial,
        IUserProfileService user, AppDbContext db)
    {
        _shop = shop; _vet = vet; _pet = pet;
        _order = order; _testimonial = testimonial;
        _user = user; _db = db;
    }

    // ---------- DASHBOARD ----------
    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var roleIds = await _db.Roles.ToDictionaryAsync(r => r.Name!, r => r.Id);

        async Task<int> CountRole(string role) =>
            roleIds.TryGetValue(role, out var id)
                ? await _db.UserRoles.CountAsync(ur => ur.RoleId == id) : 0;

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
            AvailablePets = await _db.Pets.CountAsync(x => x.AdoptionStatus == AdoptionStatus.Available && x.IsApproved),
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
            .OrderBy(x => x.Month).ToListAsync();

        d.MonthlyAdoptions = await _db.AdoptionRequests
            .Where(x => x.CreatedAt >= from && x.Status == RequestStatus.Approved)
            .GroupBy(x => new { x.CreatedAt.Year, x.CreatedAt.Month })
            .Select(g => new MonthlyStatDto
            {
                Month = g.Key.Year + "-" + g.Key.Month.ToString("D2"),
                Count = g.Count()
            })
            .OrderBy(x => x.Month).ToListAsync();

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
}