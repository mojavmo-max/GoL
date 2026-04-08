namespace UserProfile.Services;

public interface IFileStorageService
{
    Task<string> SaveAvatarAsync(Stream fileStream, string fileName, int userId);
    Task<bool> DeleteAvatarAsync(string filePath);
    string GetAvatarUrl(string filePath);
}

public class FileStorageService : IFileStorageService
{
    private readonly string _uploadDirectory;
    private readonly string _baseUrl;

    public FileStorageService(IWebHostEnvironment environment)
    {
        _uploadDirectory = Path.Combine(environment.ContentRootPath, "uploads", "avatars");
        _baseUrl = "/api/uploads/avatars";
        
        // Ensure directory exists
        if (!Directory.Exists(_uploadDirectory))
        {
            Directory.CreateDirectory(_uploadDirectory);
        }
    }

    public async Task<string> SaveAvatarAsync(Stream fileStream, string fileName, int userId)
    {
        var fileExtension = Path.GetExtension(fileName);
        var uniqueFileName = $"{userId}_{DateTime.UtcNow.Ticks}{fileExtension}";
        var filePath = Path.Combine(_uploadDirectory, uniqueFileName);

        using (var file = new FileStream(filePath, FileMode.Create, FileAccess.Write))
        {
            await fileStream.CopyToAsync(file);
        }

        return Path.Combine("avatars", uniqueFileName).Replace("\\", "/");
    }

    public async Task<bool> DeleteAvatarAsync(string filePath)
    {
        var fullPath = Path.Combine(_uploadDirectory, Path.GetFileName(filePath));
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            return true;
        }
        return false;
    }

    public string GetAvatarUrl(string filePath)
    {
        if (string.IsNullOrEmpty(filePath))
            return null!;
        return $"{_baseUrl}/{Path.GetFileName(filePath)}";
    }
}
