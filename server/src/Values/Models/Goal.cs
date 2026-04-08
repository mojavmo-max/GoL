namespace Values.Models;

/// <summary>
/// Represents a core life value with progress tracking and associated tasks
/// </summary>
public class Goal
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public Value Category { get; set; }
    public string Description { get; set; } = null!;
    public decimal ProgressScore { get; set; } = 0m; // 0-100
    public string? ColorHex { get; set; } // Optional: for UI display
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation
    public ICollection<Task> Tasks { get; set; } = new List<Task>();
}
