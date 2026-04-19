namespace Resources.Api.Dtos;

public class GetResourcesResponse
{
    public List<ResourceItemDto> Items { get; set; } = new();
    public int CurrentPage { get; set; }
    public int TotalPages { get; set; }
    public int TotalItems { get; set; }
    public bool HasNextPage => CurrentPage < TotalPages;
    public bool HasPreviousPage => CurrentPage > 1;
}