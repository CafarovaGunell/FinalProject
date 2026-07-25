
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ViViPaw.DTOs.Vet;
using ViViPaw.Helpers;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Identity;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Controllers;

[ApiController]
[Route("api/appointments")]
public class AppointmentController : ControllerBase
{
    private readonly IAppointmentService _service;
    public AppointmentController(IAppointmentService service) => _service = service;

    /// <summary>Boş slotlar. date: 2026-08-01</summary>
    [HttpGet("slots")]
    [AllowAnonymous]
    public async Task<IActionResult> Slots(
        [FromQuery] int vetProfileId,
        [FromQuery] DateTime date,
        [FromQuery] int serviceId)
    {
        var r = await _service.GetAvailableSlotsAsync(vetProfileId, date, serviceId);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    /// <summary>Randevu yaz</summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] AppointmentCreateDto dto)
    {
        var r = await _service.CreateAsync(User.GetUserId(), dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpGet("my-appointments")]
    [Authorize]
    public async Task<IActionResult> My([FromQuery] AppointmentStatus? status)
        => Ok(await _service.GetMyAppointmentsAsync(User.GetUserId(), status));

    /// <summary>Baytarın randevuları</summary>
    [HttpGet("vet-appointments")]
    [Authorize(Roles = Roles.Veterinarian)]
    public async Task<IActionResult> VetList([FromQuery] AppointmentStatus? status, [FromQuery] DateTime? date)
        => Ok(await _service.GetVetAppointmentsAsync(User.GetUserId(), status, date));

    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        var isAdmin = User.IsInAnyRole(Roles.Admin, Roles.SuperAdmin);
        var r = await _service.GetByIdAsync(User.GetUserId(), isAdmin, id);
        return r.Success ? Ok(r) : NotFound(r);
    }

    /// <summary>Baytar: status dəyiş (2=Confirmed, 3=Completed, 4=Cancelled, 5=NoShow)</summary>
    [HttpPut("{id:int}/status")]
    [Authorize(Roles = Roles.Veterinarian)]
    public async Task<IActionResult> ChangeStatus(int id,
        [FromQuery] AppointmentStatus status, [FromQuery] string? reason)
    {
        var r = await _service.ChangeStatusAsync(User.GetUserId(), id, status, reason);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    /// <summary>Müştəri ləğvi (2 saatdan az qalıbsa olmaz)</summary>
    [HttpPut("{id:int}/cancel")]
    [Authorize]
    public async Task<IActionResult> Cancel(int id, [FromQuery] string? reason)
    {
        var r = await _service.CancelByCustomerAsync(User.GetUserId(), id, reason);
        return r.Success ? Ok(r) : BadRequest(r);
    }
}