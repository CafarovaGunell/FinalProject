// Controllers/ProductReviewController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ViViPaw.DTOs.Product;
using ViViPaw.Helpers;
using ViViPaw.Models.Identity;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Controllers;

[ApiController]
[Route("api/product-reviews")]
public class ProductReviewController : ControllerBase
{
    private readonly IProductReviewService _service;
    public ProductReviewController(IProductReviewService service) => _service = service;

    [HttpGet("by-product/{productId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> ByProduct(int productId)
        => Ok(await _service.GetByProductAsync(productId));

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] ProductReviewCreateDto dto)
    {
        var r = await _service.CreateAsync(User.GetUserId(), dto);
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