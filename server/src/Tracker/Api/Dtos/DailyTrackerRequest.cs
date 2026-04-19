namespace Tracker.Api.Dtos;

public class DailyTrackerRequest
{
    public DateTime Date { get; set; }
    public List<PlanRequest> Plans { get; set; } = new();
}
