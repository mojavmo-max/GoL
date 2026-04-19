namespace Resources.Api.Dtos;

public class GetResourcesRequest
{
    public string Query { get; set; } = string.Empty;
    public string ResourceTypes { get; set; } = string.Empty; // Comma-separated: movie,book,video,article,podcast
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}