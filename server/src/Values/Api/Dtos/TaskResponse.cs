using TaskStatus = Values.Models.TaskStatus;

namespace Values.Api.Dtos;

/// <summary>
/// Response DTO for Task
/// </summary>
public class TaskResponse
{
    public int Id { get; set; }
    public int GoalId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public TaskStatus Status { get; set; }
    public int Points { get; set; }
    public int Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int Frequency { get; set; }
    public string FrequencyType { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
