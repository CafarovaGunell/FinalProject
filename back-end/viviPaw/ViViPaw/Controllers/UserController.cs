
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ViViPaw.DTOs.User;
using ViViPaw.Helpers;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserProfileService _service;
    public UserController(IUserProfileService service) => _service = service;

    [HttpGet("profile")]
    public async Task<IActionResult> Profile()
    {
        var r = await _service.GetMyProfileAsync(User.GetUserId());
        return r.Success ? Ok(r) : NotFound(r);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> Update([FromBody] UpdateProfileDto dto)
    {
        var r = await _service.UpdateAsync(User.GetUserId(), dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }
}