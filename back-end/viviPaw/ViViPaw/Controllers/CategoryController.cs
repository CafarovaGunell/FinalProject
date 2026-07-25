// Controllers/CategoryController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ViViPaw.DTOs.Category;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Identity;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly ICategoryService _service;
    public CategoryController(ICategoryService service) => _service = service;

    /// <summary>type: 1=Pet, 2=Product, 3=Article (boş buraxsanız hamısı)</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] CategoryType? type)
        => Ok(await _service.GetAllAsync(type));

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var r = await _service.GetByIdAsync(id);
        return r.Success ? Ok(r) : NotFound(r);
    }

    [HttpPost]
    [Authorize(Roles = Roles.AdminOrSuper)]
    public async Task<IActionResult> Create([FromBody] CategoryCreateDto dto)
    {
        var r = await _service.CreateAsync(dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.AdminOrSuper)]
    public async Task<IActionResult> Update(int id, [FromBody] CategoryCreateDto dto)
    {
        var r = await _service.UpdateAsync(id, dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.AdminOrSuper)]
    public async Task<IActionResult> Delete(int id)
    {
        var r = await _service.DeleteAsync(id);
        return r.Success ? Ok(r) : BadRequest(r);
    }
}