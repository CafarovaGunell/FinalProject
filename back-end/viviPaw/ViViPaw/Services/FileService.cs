// Services/FileService.cs
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Services;

public class FileService : IFileService
{
    private readonly IWebHostEnvironment _env;
    private readonly IHttpContextAccessor _http;

    private static readonly string[] AllowedExt = { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
    private const long MaxSize = 5 * 1024 * 1024; // 5 MB

    public FileService(IWebHostEnvironment env, IHttpContextAccessor http)
    {
        _env = env;
        _http = http;
    }

    public async Task<string> UploadAsync(IFormFile file, string folder)
    {
        if (file is null || file.Length == 0)
            throw new ArgumentException("Fayl boşdur.");

        if (file.Length > MaxSize)
            throw new ArgumentException("Fayl həcmi 5 MB-dan çox ola bilməz.");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExt.Contains(ext))
            throw new ArgumentException("Yalnız şəkil faylları icazəlidir (jpg, jpeg, png, webp, gif).");

        var root = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var dir = Path.Combine(root, "uploads", folder);
        Directory.CreateDirectory(dir);

        var fileName = $"{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(dir, fileName);

        await using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream);

        // Frontend üçün tam URL
        var req = _http.HttpContext!.Request;
        return $"{req.Scheme}://{req.Host}/uploads/{folder}/{fileName}";
    }

    public async Task<List<string>> UploadManyAsync(List<IFormFile> files, string folder)
    {
        var urls = new List<string>();
        foreach (var f in files)
            urls.Add(await UploadAsync(f, folder));
        return urls;
    }

    public void Delete(string? relativeUrl)
    {
        if (string.IsNullOrWhiteSpace(relativeUrl)) return;

        try
        {
            var path = new Uri(relativeUrl).AbsolutePath.TrimStart('/'); // uploads/pets/xxx.jpg
            var root = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var full = Path.Combine(root, path.Replace('/', Path.DirectorySeparatorChar));

            if (File.Exists(full)) File.Delete(full);
        }
        catch { /* silinmə xətası kritik deyil */ }
    }
}