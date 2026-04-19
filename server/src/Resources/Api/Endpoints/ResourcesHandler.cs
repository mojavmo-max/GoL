using Resources.Api.Dtos;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace Resources.Api.Endpoints;

public static class ResourcesHandler
{
    public static WebApplication MapResourcesEndpoints(this WebApplication app)
    {
        app.MapPost("/resources/{userId}", async (int userId, GetResourcesRequest req, IConfiguration config) =>
        {
            try
            {
                // Validate request
                if (string.IsNullOrWhiteSpace(req.Query))
                {
                    return Results.BadRequest("Query is required");
                }

                if (string.IsNullOrWhiteSpace(req.ResourceTypes))
                {
                    return Results.BadRequest("ResourceTypes is required");
                }

                // Parse resource types
                var resourceTypes = req.ResourceTypes.Split(',')
                    .Select(t => t.Trim().ToLower())
                    .Where(t => !string.IsNullOrEmpty(t))
                    .ToList();

                if (!resourceTypes.Any())
                {
                    return Results.BadRequest("At least one resource type is required");
                }

                // Validate resource types
                var validTypes = new[] { "movie", "book", "video", "article", "podcast" };
                var invalidTypes = resourceTypes.Where(t => !validTypes.Contains(t)).ToList();
                if (invalidTypes.Any())
                {
                    return Results.BadRequest($"Invalid resource types: {string.Join(", ", invalidTypes)}. Valid types: {string.Join(", ", validTypes)}");
                }

                // Get OpenAI API key from configuration
                var apiKey = config["OpenAI:ApiKey"];
                if (string.IsNullOrEmpty(apiKey))
                {
                    return Results.StatusCode(500);
                }

                // Generate resources using OpenAI
                var resources = await GenerateResourcesWithOpenAI(req.Query, resourceTypes, apiKey);

                // Apply pagination
                var totalItems = resources.Count;
                var totalPages = (int)Math.Ceiling(totalItems / (double)req.PageSize);
                var currentPage = Math.Min(req.Page, totalPages);
                var startIndex = (currentPage - 1) * req.PageSize;
                var paginatedItems = resources.Skip(startIndex).Take(req.PageSize).ToList();

                var response = new GetResourcesResponse
                {
                    Items = paginatedItems,
                    CurrentPage = currentPage,
                    TotalPages = totalPages,
                    TotalItems = totalItems
                };

                return Results.Ok(response);
            }
            catch (Exception ex)
            {
                // Log the error (in a real app, use proper logging)
                Console.WriteLine($"Error in resources endpoint: {ex.Message}");
                return Results.StatusCode(500);
            }
        });

        return app;
    }

    private static async Task<List<ResourceItemDto>> GenerateResourcesWithOpenAI(string query, List<string> resourceTypes, string apiKey)
    {
        using var client = new HttpClient();
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

        var prompt = BuildPrompt(query, resourceTypes);

        var requestBody = new
        {
            model = "gpt-3.5-turbo",
            messages = new[]
            {
                new { role = "system", content = "You are a helpful assistant that recommends resources. Always respond with valid JSON." },
                new { role = "user", content = prompt }
            },
            max_tokens = 2000,
            temperature = 0.7
        };

        var response = await client.PostAsJsonAsync("https://api.openai.com/v1/chat/completions", requestBody);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"OpenAI API error: {response.StatusCode}, Content: {errorContent}");
            throw new Exception($"OpenAI API error: {response.StatusCode}");
        }

        var responseContent = await response.Content.ReadAsStringAsync();
        Console.WriteLine($"OpenAI response received, length: {responseContent.Length}");
        var openAiResponse = JsonSerializer.Deserialize<OpenAiResponse>(responseContent);

        if (openAiResponse?.choices == null || !openAiResponse.choices.Any())
        {
            throw new Exception("Invalid OpenAI response");
        }

        var content = openAiResponse.choices[0].message?.content;
        if (string.IsNullOrEmpty(content))
        {
            throw new Exception("Empty content in OpenAI response");
        }

        try
        {
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            var resources = JsonSerializer.Deserialize<List<ResourceItemDto>>(content, options);
            return resources ?? new List<ResourceItemDto>();
        }
        catch (Exception)
        {
            // If JSON parsing fails, try to extract JSON from the response
            var jsonStart = content.IndexOf('[');
            var jsonEnd = content.LastIndexOf(']');

            if (jsonStart >= 0 && jsonEnd > jsonStart)
            {
                var jsonContent = content.Substring(jsonStart, jsonEnd - jsonStart + 1);
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var resources = JsonSerializer.Deserialize<List<ResourceItemDto>>(jsonContent, options);
                return resources ?? new List<ResourceItemDto>();
            }

            throw new Exception("Failed to parse OpenAI response as JSON");
        }
    }

    private static string BuildPrompt(string query, List<string> resourceTypes)
    {
        var typesText = string.Join(", ", resourceTypes);
        return $@"
Based on the user's query: ""{query}""

Please recommend {resourceTypes.Count} different types of resources: {typesText}.

Provide up to top 20 high-quality recommendations in order of relevance.

Respond with a JSON array of objects, each with these properties:
- name: The title/name of the resource
- description: A brief 1-2 sentence description
- url: The URL if it's online content (leave empty string for books/movies that don't have direct links)
- type: The resource type (one of: {typesText})

Example format:
[
  {{
    ""name"": ""Resource Title"",
    ""description"": ""Brief description of the resource."",
    ""url"": ""https://example.com"",
    ""type"": ""article""
  }}
]

Ensure the recommendations are relevant, high-quality, and diverse. Focus on well-known, reputable sources.";
    }

    private class OpenAiResponse
    {
        public Choice[]? choices { get; set; }

        public class Choice
        {
            public Message? message { get; set; }
        }

        public class Message
        {
            public string? content { get; set; }
        }
    }
}