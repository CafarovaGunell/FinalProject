
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ViViPaw.DTOs.Cart;
using ViViPaw.Helpers;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ICartService _service;
    public CartController(ICartService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> MyCart()
        => Ok(await _service.GetMyCartAsync(User.GetUserId()));

    [HttpPost("add")]
    public async Task<IActionResult> Add([FromBody] AddToCartDto dto)
    {
        var r = await _service.AddAsync(User.GetUserId(), dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpPut("items/{itemId:int}")]
    public async Task<IActionResult> UpdateItem(int itemId, [FromBody] UpdateCartItemDto dto)
    {
        var r = await _service.UpdateItemAsync(User.GetUserId(), itemId, dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpDelete("items/{itemId:int}")]
    public async Task<IActionResult> RemoveItem(int itemId)
    {
        var r = await _service.RemoveItemAsync(User.GetUserId(), itemId);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> Clear()
        => Ok(await _service.ClearAsync(User.GetUserId()));
}


