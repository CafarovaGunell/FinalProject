
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ViViPaw.DTOs.Adoption;
using ViViPaw.Helpers;
using ViViPaw.Models.Identity;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Controllers;

[ApiController]
[Route("api/adoption-requests")]
[Authorize]
public class AdoptionRequestController : ControllerBase
{
    private readonly IAdoptionRequestService _service;
    public AdoptionRequestController(IAdoptionRequestService service) => _service = service;

    //Sahiblənmə müraciəti göndər
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AdoptionRequestCreateDto dto)
    {
        var r = await _service.CreateAsync(User.GetUserId(), dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    //Mənim göndərdiyim müraciətlər
    [HttpGet("my-requests")]
    public async Task<IActionResult> MyRequests()
        => Ok(await _service.GetMyRequestsAsync(User.GetUserId()));

    //Mənim elanlarıma gələn müraciətlər
    [HttpGet("received")]
    public async Task<IActionResult> Received()
        => Ok(await _service.GetReceivedAsync(User.GetUserId()));

    [HttpGet("by-pet/{petId:int}")]
    public async Task<IActionResult> ByPet(int petId)
    {
        var r = await _service.GetByPetAsync(User.GetUserId(), petId);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    //Təsdiq / rədd (status: 2=Approved, 3=Rejected)
    [HttpPut("{id:int}/review")]
    public async Task<IActionResult> Review(int id, [FromBody] AdoptionRequestReviewDto dto)
    {
        var r = await _service.ReviewAsync(User.GetUserId(), id, dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpPut("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var r = await _service.CancelAsync(User.GetUserId(), id);
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