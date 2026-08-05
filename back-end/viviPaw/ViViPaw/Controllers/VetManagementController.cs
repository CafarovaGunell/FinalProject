
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ViViPaw.DTOs.Vet;
using ViViPaw.Helpers;
using ViViPaw.Models.Identity;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Controllers;

[ApiController]
[Route("api/vet-management")]
public class VetManagementController : ControllerBase
{
    private readonly IVetManagementService _service;
    public VetManagementController(IVetManagementService service) => _service = service;

    // XİDMƏTLƏR 

    [HttpGet("{vetProfileId:int}/services")]
    [AllowAnonymous]
    public async Task<IActionResult> Services(int vetProfileId)
        => Ok(await _service.GetServicesAsync(vetProfileId));

    [HttpPost("services")]
    [Authorize(Roles = Roles.Veterinarian)]
    public async Task<IActionResult> CreateService([FromBody] VetServiceCreateDto dto)
    {
        var r = await _service.CreateServiceAsync(User.GetUserId(), dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpPut("services/{id:int}")]
    [Authorize(Roles = Roles.Veterinarian)]
    public async Task<IActionResult> UpdateService(int id, [FromBody] VetServiceCreateDto dto)
    {
        var r = await _service.UpdateServiceAsync(User.GetUserId(), id, dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpDelete("services/{id:int}")]
    [Authorize(Roles = Roles.Veterinarian)]
    public async Task<IActionResult> DeleteService(int id)
    {
        var r = await _service.DeleteServiceAsync(User.GetUserId(), id);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    // QraFik

    [HttpGet("{vetProfileId:int}/schedules")]
    [AllowAnonymous]
    public async Task<IActionResult> Schedules(int vetProfileId)
        => Ok(await _service.GetSchedulesAsync(vetProfileId));




    //Qrafik əlavə/yenilə (eyni gün varsa əvəz olunur)
    [HttpPost("schedules")]
    [Authorize(Roles = Roles.Veterinarian)]
    public async Task<IActionResult> CreateSchedule([FromBody] VetScheduleCreateDto dto)
    {
        var r = await _service.CreateScheduleAsync(User.GetUserId(), dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpDelete("schedules/{id:int}")]
    [Authorize(Roles = Roles.Veterinarian)]
    public async Task<IActionResult> DeleteSchedule(int id)
    {
        var r = await _service.DeleteScheduleAsync(User.GetUserId(), id);
        return r.Success ? Ok(r) : BadRequest(r);
    }




    // MƏZUNİYYƏT 
    [HttpGet("time-offs")]
    [Authorize(Roles = Roles.Veterinarian)]
    public async Task<IActionResult> TimeOffs()
        => Ok(await _service.GetTimeOffsAsync(User.GetUserId()));

    [HttpPost("time-offs")]
    [Authorize(Roles = Roles.Veterinarian)]
    public async Task<IActionResult> CreateTimeOff([FromBody] VetTimeOffCreateDto dto)
    {
        var r = await _service.CreateTimeOffAsync(User.GetUserId(), dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpDelete("time-offs/{id:int}")]
    [Authorize(Roles = Roles.Veterinarian)]
    public async Task<IActionResult> DeleteTimeOff(int id)
    {
        var r = await _service.DeleteTimeOffAsync(User.GetUserId(), id);
        return r.Success ? Ok(r) : BadRequest(r);
    }
}