namespace Resources.Api.Dtos;

public class ResourceItemDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty; // Optional URL for hyperlinking
    public string Type { get; set; } = string.Empty; // movie, book, video, article, podcast
}