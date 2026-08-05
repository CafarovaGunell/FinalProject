
namespace ViViPaw.Services.Interfaces;

public interface IFileService
{
    Task<string> UploadAsync(IFormFile file, string folder);
    Task<List<string>> UploadManyAsync(List<IFormFile> files, string folder);
    void Delete(string? relativeUrl);
}