namespace UserProfile.Api.Dtos;

public class AvatarUploadResponse
{
    public string Message { get; set; } = null!;
    public string AvatarUrl { get; set; } = null!;
    public string? Model3dGenerationUrl { get; set; }
}
