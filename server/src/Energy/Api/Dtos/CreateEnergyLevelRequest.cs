namespace Energy.Api.Dtos;

public class CreateEnergyLevelRequest
{
    public decimal? PhysicalScore { get; set; }
    public decimal? MentalScore { get; set; }
    public decimal? EmotionalScore { get; set; }
    public decimal? SpiritualScore { get; set; }
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
    public string? Description { get; set; }
}
