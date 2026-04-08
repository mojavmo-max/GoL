namespace UserProfile.Api.Dtos;

public class UserProfileRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? CharacterName { get; set; }
    public int? Age { get; set; }
    public decimal? Salary { get; set; }
    public string? RelationshipStatus { get; set; }
}
