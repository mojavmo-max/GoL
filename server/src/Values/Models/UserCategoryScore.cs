namespace Values.Models;

/// <summary>
/// Stores aggregate score and computed level per user and value category.
/// </summary>
public class UserCategoryScore
{
    public int UserId { get; set; }
    public int CategoryId { get; set; }
    public int Score { get; set; }
    public int LevelNumber { get; set; }
}
