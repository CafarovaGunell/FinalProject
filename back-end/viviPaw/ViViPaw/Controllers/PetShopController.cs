// Controllers/PetShopController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ViViPaw.DTOs.PetShop;
using ViViPaw.Helpers;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Identity;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PetShopController : ControllerBase
{
    private readonly IPetShopService _service;
    public PetShopController(IPetShopService service) => _service = service;

    /// <summary>Mağaza profili yarat (PetShop rolu, bir dəfə)</summary>
    [HttpPost]
    [Authorize(Roles = Roles.PetShop)]
    public async Task<IActionResult> Create([FromBody] PetShopCreateDto dto)
    {
        var r = await _service.CreateAsync(User.GetUserId(), dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpPut]
    [Authorize(Roles = Roles.PetShop)]
    public async Task<IActionResult> Update([FromBody] PetShopUpdateDto dto)
    {
        var r = await _service.UpdateAsync(User.GetUserId(), dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpGet("my-shop")]
    [Authorize(Roles = Roles.PetShop)]
    public async Task<IActionResult> MyShop()
    {
        var r = await _service.GetMyShopAsync(User.GetUserId());
        return r.Success ? Ok(r) : NotFound(r);
    }

    /// <summary>Təsdiqlənmiş mağazalar (public)</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] string? city)
        => Ok(await _service.GetAllAsync(ApprovalStatus.Approved, city));

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var r = await _service.GetByIdAsync(id);
        return r.Success ? Ok(r) : NotFound(r);
    }
}