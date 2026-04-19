namespace Energy.Models;

public class EnergyLevel
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal? PhysicalScore { get; set; }
    public decimal? MentalScore { get; set; }
    public decimal? EmotionalScore { get; set; }
    public decimal? SpiritualScore { get; set; }
    public decimal? OverallScore { get; set; }
    public DateTime RecordedAt { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
