
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ViViPaw.DTOs.Order;
using ViViPaw.Helpers;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Identity;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrderController : ControllerBase
{
    private readonly IOrderService _service;
    public OrderController(IOrderService service) => _service = service;

    //Səbətdən sifariş yarat
    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] OrderCreateDto dto)
    {
        var r = await _service.CreateAsync(User.GetUserId(), dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpGet("my-orders")]
    public async Task<IActionResult> MyOrders()
        => Ok(await _service.GetMyOrdersAsync(User.GetUserId()));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var isAdmin = User.IsInAnyRole(Roles.Admin, Roles.SuperAdmin);
        var r = await _service.GetByIdAsync(User.GetUserId(), isAdmin, id);
        return r.Success ? Ok(r) : NotFound(r);
    }






    [HttpGet("shop-orders")]
    [Authorize(Roles = Roles.PetShop)]
    public async Task<IActionResult> ShopOrders([FromQuery] OrderStatus? status)
        => Ok(await _service.GetShopOrdersAsync(User.GetUserId(), status));




    //Status dəyiş 
    [HttpPut("{id:int}/status")]
    [Authorize(Roles = $"{Roles.PetShop},{Roles.Admin},{Roles.SuperAdmin}")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        var isAdmin = User.IsInAnyRole(Roles.Admin, Roles.SuperAdmin);
        var r = await _service.UpdateStatusAsync(User.GetUserId(), isAdmin, id, dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

  //Müştəri ləğvi
    [HttpPut("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id, [FromQuery] string? reason)
    {
        var r = await _service.CancelAsync(User.GetUserId(), id, reason);
        return r.Success ? Ok(r) : BadRequest(r);
    }
}