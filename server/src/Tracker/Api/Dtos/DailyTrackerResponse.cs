namespace Tracker.Api.Dtos;

public class DailyTrackerResponse
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateTime Date { get; set; }
    public List<PlanResponse> Plans { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
