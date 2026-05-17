namespace Values.Api.Dtos;

/// <summary>
/// Response DTO for task details view combining goal, task, and category score data
/// </summary>
public class TaskDetailsResponse
{
    public int GoalId { get; set; }
    public int UserId { get; set; }
    public int Category { get; set; }
    public string GoalDescription { get; set; } = null!;
    public int GoalStatus { get; set; }
    public string? ColorHex { get; set; }
    public bool IsActive { get; set; }
    public DateTime GoalCreatedAt { get; set; }
    public DateTime GoalUpdatedAt { get; set; }
    public int CategoryScore { get; set; }
    public int CategoryLevel { get; set; }
    public int? TaskId { get; set; }
    public string? TaskName { get; set; }
    public string? TaskDescription { get; set; }
    public int? TaskStatus { get; set; }
    public int? TaskPoints { get; set; }
    public DateTime? TaskCompletedAt { get; set; }
}
