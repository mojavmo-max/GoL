namespace Values.Models;

/// <summary>
/// Represents a specific challenge or action a user completes to progress on a Value
/// </summary>
public class Task
{
    public int Id { get; set; }
    public int GoalId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public TaskStatus Status { get; set; } = TaskStatus.Pending;
    public int Points { get; set; } = 10; // Points awarded on completion
    public int Priority { get; set; } = 1; // 1=Low, 2=Medium, 3=High
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int Frequency { get; set; } = 1; // How many times to complete this week/month
    public string FrequencyType { get; set; } = "weekly"; // weekly, monthly, once
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation
    public Goal Goal { get; set; } = null!;
}
