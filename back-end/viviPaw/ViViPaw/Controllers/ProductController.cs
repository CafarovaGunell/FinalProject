
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ViViPaw.DTOs.Product;
using ViViPaw.Helpers;
using ViViPaw.Models.Identity;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly IProductService _service;
    public ProductController(IProductService service) => _service = service;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] ProductFilterDto filter)
        => Ok(await _service.GetAllAsync(filter));

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var r = await _service.GetByIdAsync(id);
        return r.Success ? Ok(r) : NotFound(r);
    }

    [HttpGet("my-products")]
    [Authorize(Roles = Roles.PetShop)]
    public async Task<IActionResult> MyProducts()
        => Ok(await _service.GetMyProductsAsync(User.GetUserId()));

    [HttpPost]
    [Authorize(Roles = Roles.PetShop)]
    public async Task<IActionResult> Create([FromBody] ProductCreateDto dto)
    {
        var r = await _service.CreateAsync(User.GetUserId(), dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] ProductUpdateDto dto)
    {
        var isAdmin = User.IsInAnyRole(Roles.Admin, Roles.SuperAdmin);
        var r = await _service.UpdateAsync(User.GetUserId(), isAdmin, id, dto);
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