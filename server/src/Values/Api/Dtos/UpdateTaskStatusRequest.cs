using TaskStatus = Values.Models.TaskStatus;

namespace Values.Api.Dtos;

/// <summary>
/// Request DTO to update task status
/// </summary>
public class UpdateTaskStatusRequest
{
    public TaskStatus Status { get; set; }
}
