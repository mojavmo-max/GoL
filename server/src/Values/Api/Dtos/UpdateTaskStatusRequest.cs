using Status = Values.Models.Status;

namespace Values.Api.Dtos;

/// <summary>
/// Request DTO to update task status
/// </summary>
public class UpdateTaskStatusRequest
{
    public Status Status { get; set; }
}
