
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ViViPaw.DTOs.Pet;
using ViViPaw.Helpers;
using ViViPaw.Models.Identity;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PetController : ControllerBase
{
    private readonly IPetService _service;
    public PetController(IPetService service) => _service = service;

    //Bütün heyvanlar (filtr + səhifələmə)
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] PetFilterDto filter)
        => Ok(await _service.GetAllAsync(filter));

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var r = await _service.GetByIdAsync(id);
        return r.Success ? Ok(r) : NotFound(r);
    }

 


    [HttpGet("my-pets")]
    [Authorize(Roles = $"{Roles.Customer},{Roles.PetShop}")]
    public async Task<IActionResult> MyPets()
        => Ok(await _service.GetMyPetsAsync(User.GetUserId()));

    [HttpPost]
    [Authorize(Roles = $"{Roles.Customer},{Roles.PetShop}")]
    public async Task<IActionResult> Create([FromBody] PetCreateDto dto)
    {
        var r = await _service.CreateAsync(User.GetUserId(), dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] PetUpdateDto dto)
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