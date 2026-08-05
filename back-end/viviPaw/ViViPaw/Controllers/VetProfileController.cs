
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ViViPaw.DTOs.Vet;
using ViViPaw.Helpers;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Identity;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Controllers;

[ApiController]
[Route("api/vet-profile")]
public class VetProfileController : ControllerBase
{
    private readonly IVetProfileService _service;
    public VetProfileController(IVetProfileService service) => _service = service;

    [HttpPost]
    [Authorize(Roles = Roles.Veterinarian)]
    public async Task<IActionResult> Create([FromBody] VetProfileCreateDto dto)
    {
        var r = await _service.CreateAsync(User.GetUserId(), dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpPut]
    [Authorize(Roles = Roles.Veterinarian)]
    public async Task<IActionResult> Update([FromBody] VetProfileUpdateDto dto)
    {
        var r = await _service.UpdateAsync(User.GetUserId(), dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpGet("me")]
    [Authorize(Roles = Roles.Veterinarian)]
    public async Task<IActionResult> Me()
    {
        var r = await _service.GetMyProfileAsync(User.GetUserId());
        return r.Success ? Ok(r) : NotFound(r);
    }

    //Təsdiqlənmiş baytarlar (public
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] string? city, [FromQuery] string? specialty)
        => Ok(await _service.GetAllAsync(ApprovalStatus.Approved, city, specialty));

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var r = await _service.GetByIdAsync(id);
        return r.Success ? Ok(r) : NotFound(r);
    }
}