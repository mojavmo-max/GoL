namespace Tracker.Api.Dtos;

public class PlanResponse
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public string Time { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
