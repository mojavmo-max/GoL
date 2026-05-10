namespace Values.Api.Dtos;

/// <summary>
/// Response DTO for persisted category scores per user.
/// </summary>
public class UserCategoryScoreResponse
{
    public int UserId { get; set; }
    public int CategoryId { get; set; }
    public int Score { get; set; }
    public int LevelNumber { get; set; }
}
