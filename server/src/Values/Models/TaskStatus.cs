namespace Values.Models;

/// <summary>
/// Status of a task
/// </summary>
public enum TaskStatus
{
    Pending,     // Not started
    InProgress,  // Currently working on it
    Completed,   // Finished
    Abandoned,   // Gave up
    OnHold       // Paused temporarily
}
