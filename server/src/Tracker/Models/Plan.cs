namespace Tracker.Models;

public class Plan
{
    public int Id { get; set; }
    public int DailyTrackerId { get; set; }
    public DateTime Date { get; set; }
    public string Time { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
