namespace Tracker.Api.Dtos;

public class PlanRequest
{
    public DateTime Date { get; set; }
    public string Time { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
}
