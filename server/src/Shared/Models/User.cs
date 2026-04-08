namespace Shared.Models;

public class User
{
    public int Id { get; set; }
    
    // Authentication
    public required string Email { get; set; }
    public required byte[] PasswordHash { get; set; }
    public required byte[] PasswordSalt { get; set; }
    
    // Profile Information
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public int? Age { get; set; }
    public decimal? Salary { get; set; }
    public string? RelationshipStatus { get; set; }
    public string? CharacterName { get; set; }
    
    // Avatar & 3D Model
    public string? AvatarPhotoPath { get; set; }
    public string? Model3dPath { get; set; }
    
    // Metadata
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
