namespace UserProfile.Api.Dtos;

public class UserProfileResponse
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? CharacterName { get; set; }
    public int? Age { get; set; }
    public decimal? Salary { get; set; }
    public string? RelationshipStatus { get; set; }
    public string? AvatarPhotoUrl { get; set; }
    public string? Model3dUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
