// Controllers/UploadController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ViViPaw.DTOs.Common;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadController : ControllerBase
{
    private readonly IFileService _file;

    public UploadController(IFileService file) => _file = file;

    /// <summary>Tək şəkil yüklə. folder: pets | products | users | shops | vets | articles</summary>
    [HttpPost("single")]
    public async Task<IActionResult> Single(IFormFile file, [FromQuery] string folder = "misc")
    {
        var url = await _file.UploadAsync(file, folder);
        return Ok(ApiResponse<string>.Ok(url, "Şəkil yükləndi."));
    }

    /// <summary>Çoxlu şəkil yüklə</summary>
    [HttpPost("multiple")]
    public async Task<IActionResult> Multiple(List<IFormFile> files, [FromQuery] string folder = "misc")
    {
        var urls = await _file.UploadManyAsync(files, folder);
        return Ok(ApiResponse<List<string>>.Ok(urls, "Şəkillər yükləndi."));
    }
}