namespace Values.Api.Dtos;

/// <summary>
/// Request DTO for creating a Task
/// </summary>
public class CreateTaskRequest
{
    public int GoalId { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public int Points { get; set; } = 10;
    public int Priority { get; set; } = 1;
    public DateTime? DueDate { get; set; }
    public int Frequency { get; set; } = 1;
    public string FrequencyType { get; set; } = "weekly";
}
