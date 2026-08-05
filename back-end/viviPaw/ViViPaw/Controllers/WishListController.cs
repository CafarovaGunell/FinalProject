
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ViViPaw.Helpers;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Controllers;

[ApiController]
[Route("api/wishlist")]
[Authorize]
public class WishListController : ControllerBase
{
    private readonly IWishListService _service;
    public WishListController(IWishListService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> MyList()
        => Ok(await _service.GetMyListAsync(User.GetUserId()));

    //Sadəcə ID-lər (ürək ikonu üçün)
    [HttpGet("ids")]
    public async Task<IActionResult> Ids()
        => Ok(await _service.GetMyPetIdsAsync(User.GetUserId()));

    [HttpPost("toggle/{petId:int}")]
    public async Task<IActionResult> Toggle(int petId)
    {
        var r = await _service.ToggleAsync(User.GetUserId(), petId);
        return r.Success ? Ok(r) : BadRequest(r);
    }
}