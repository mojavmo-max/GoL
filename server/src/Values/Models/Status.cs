namespace Values.Models;

/// <summary>
/// Shared status for goals and tasks
/// </summary>
public enum Status
{
    Pending,     // Not started
    InProgress,  // Currently working on it
    Completed,   // Finished
    Abandoned,   // Gave up
    OnHold       // Paused temporarily
}
