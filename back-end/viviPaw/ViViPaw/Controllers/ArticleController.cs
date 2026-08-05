
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ViViPaw.DTOs.Article;
using ViViPaw.Helpers;
using ViViPaw.Models.Identity;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArticleController : ControllerBase
{
    private readonly IArticleService _service;
    public ArticleController(IArticleService service) => _service = service;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? categoryId, [FromQuery] string? search,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 9)
        => Ok(await _service.GetAllAsync(categoryId, search, page, pageSize));

    [HttpGet("{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var r = await _service.GetBySlugAsync(slug);
        return r.Success ? Ok(r) : NotFound(r);
    }

    [HttpGet("mine")]
    [Authorize(Roles = Roles.Veterinarian)]
    public async Task<IActionResult> Mine()
        => Ok(await _service.GetMineAsync(User.GetUserId()));

    [HttpPost]
    [Authorize(Roles = Roles.Veterinarian)]
    public async Task<IActionResult> Create([FromBody] ArticleCreateDto dto)
    {
        var r = await _service.CreateAsync(User.GetUserId(), dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] ArticleUpdateDto dto)
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