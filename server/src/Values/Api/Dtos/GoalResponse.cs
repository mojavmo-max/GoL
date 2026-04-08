using Values.Models;

namespace Values.Api.Dtos;

/// <summary>
/// Response DTO for Goal
/// </summary>
public class GoalResponse
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public Value Category { get; set; }
    public string Description { get; set; } = null!;
    public decimal ProgressScore { get; set; }
    public string? ColorHex { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<TaskResponse> Tasks { get; set; } = new();
}
