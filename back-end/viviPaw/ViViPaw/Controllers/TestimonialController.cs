// Controllers/TestimonialController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ViViPaw.DTOs.Testimonial;
using ViViPaw.Helpers;
using ViViPaw.Models.Identity;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestimonialController : ControllerBase
{
    private readonly ITestimonialService _service;
    public TestimonialController(ITestimonialService service) => _service = service;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetApproved()
    {
        int? userId = User.Identity?.IsAuthenticated == true ? User.GetUserId() : null;
        return Ok(await _service.GetApprovedAsync(userId));
    }

    [HttpGet("mine")]
    [Authorize]
    public async Task<IActionResult> Mine()
        => Ok(await _service.GetMineAsync(User.GetUserId()));

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] TestimonialCreateDto dto)
    {
        var r = await _service.CreateAsync(User.GetUserId(), dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpPost("{id:int}/like")]
    [Authorize]
    public async Task<IActionResult> Like(int id)
    {
        var r = await _service.ToggleLikeAsync(User.GetUserId(), id);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var isAdmin = User.IsInAnyRole(Roles.Admin, Roles.SuperAdmin);
        var r = await _service.DeleteAsync(User.GetUserId(), isAdmin, id);
        return r.Success ? Ok(r) : BadRequest(r);
    }
}