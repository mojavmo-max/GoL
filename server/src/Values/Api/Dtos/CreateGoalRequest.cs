using Values.Models;

namespace Values.Api.Dtos;

/// <summary>
/// Request DTO for creating a Goal
/// </summary>
public class CreateGoalRequest
{
    public Value Category { get; set; }
    public required string Description { get; set; }
    public string? ColorHex { get; set; }
}
