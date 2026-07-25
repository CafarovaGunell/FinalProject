
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ViViPaw.Helpers;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _service;
    public NotificationController(INotificationService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> My([FromQuery] bool unreadOnly = false)
        => Ok(await _service.GetMyAsync(User.GetUserId(), unreadOnly));

    [HttpGet("unread-count")]
    public async Task<IActionResult> UnreadCount()
        => Ok(await _service.GetUnreadCountAsync(User.GetUserId()));

    [HttpPut("{id:int}/read")]
    public async Task<IActionResult> Read(int id)
        => Ok(await _service.MarkAsReadAsync(User.GetUserId(), id));

    [HttpPut("read-all")]
    public async Task<IActionResult> ReadAll()
        => Ok(await _service.MarkAllAsReadAsync(User.GetUserId()));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => Ok(await _service.DeleteAsync(User.GetUserId(), id));
}