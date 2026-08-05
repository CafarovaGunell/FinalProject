
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ViViPaw.DTOs.Auth;
using ViViPaw.DTOs.Common;
using ViViPaw.Helpers;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

  
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _auth.RegisterAsync(dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }





    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _auth.LoginAsync(dto);
        return result.Success ? Ok(result) : Unauthorized(result);
    }



    //Access token-i yenilə
    [HttpPost("refresh-token")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenDto dto)
    {
        var result = await _auth.RefreshTokenAsync(dto);
        return result.Success ? Ok(result) : Unauthorized(result);
    }





    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenDto dto)
    {
        var result = await _auth.LogoutAsync(User.GetUserId(), dto.RefreshToken);
        return Ok(result);
    }



    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var result = await _auth.ChangePasswordAsync(User.GetUserId(), dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }






    //Cari istifadəçi (token yoxlaması üçün)
    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var data = new
        {
            UserId = User.GetUserId(),
            Email = User.GetEmail(),
            FullName = User.GetFullName(),
            Roles = User.GetRoles()
        };
        return Ok(ApiResponse<object>.Ok(data));
    }
}


