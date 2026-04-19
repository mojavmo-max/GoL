using Microsoft.EntityFrameworkCore;
using Shared.DataAccess;
using Energy.Api.Dtos;
using Energy.Models;

namespace Energy.Api.Endpoints;

public static class EnergyHandler
{
    public static WebApplication MapEnergyEndpoints(this WebApplication app)
    {
        app.MapPost("/energy/{userId}", async (int userId, CreateEnergyLevelRequest req, UserDbContext db) =>
        {
            var energyLevel = new EnergyLevel
            {
                UserId = userId,
                PhysicalScore = req.PhysicalScore,
                MentalScore = req.MentalScore,
                EmotionalScore = req.EmotionalScore,
                SpiritualScore = req.SpiritualScore,
                RecordedAt = req.RecordedAt,
                Description = req.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var scores = new List<decimal>();
            if (req.PhysicalScore.HasValue) scores.Add(req.PhysicalScore.Value);
            if (req.MentalScore.HasValue) scores.Add(req.MentalScore.Value);
            if (req.EmotionalScore.HasValue) scores.Add(req.EmotionalScore.Value);
            if (req.SpiritualScore.HasValue) scores.Add(req.SpiritualScore.Value);
            energyLevel.OverallScore = scores.Any() ? scores.Average() : null;

            db.EnergyLevels.Add(energyLevel);
            await db.SaveChangesAsync();

            var response = new EnergyLevelResponse
            {
                Id = energyLevel.Id,
                UserId = energyLevel.UserId,
                PhysicalScore = energyLevel.PhysicalScore,
                MentalScore = energyLevel.MentalScore,
                EmotionalScore = energyLevel.EmotionalScore,
                SpiritualScore = energyLevel.SpiritualScore,
                OverallScore = energyLevel.OverallScore,
                RecordedAt = energyLevel.RecordedAt,
                Description = energyLevel.Description,
                CreatedAt = energyLevel.CreatedAt,
                UpdatedAt = energyLevel.UpdatedAt
            };

            return Results.Created($"/energy/{userId}/{energyLevel.Id}", response);
        })
        .WithName("CreateEnergyLevel")
        .WithOpenApi();

        app.MapGet("/energy/{userId}/latest", async (int userId, UserDbContext db) =>
        {
            var latestEnergyLevel = await db.EnergyLevels
                .Where(e => e.UserId == userId)
                .OrderByDescending(e => e.RecordedAt)
                .FirstOrDefaultAsync();

            if (latestEnergyLevel == null)
                return Results.NotFound("No energy level data found");

            var response = new EnergyLevelResponse
            {
                Id = latestEnergyLevel.Id,
                UserId = latestEnergyLevel.UserId,
                PhysicalScore = latestEnergyLevel.PhysicalScore,
                MentalScore = latestEnergyLevel.MentalScore,
                EmotionalScore = latestEnergyLevel.EmotionalScore,
                SpiritualScore = latestEnergyLevel.SpiritualScore,
                OverallScore = latestEnergyLevel.OverallScore,
                RecordedAt = latestEnergyLevel.RecordedAt,
                Description = latestEnergyLevel.Description,
                CreatedAt = latestEnergyLevel.CreatedAt,
                UpdatedAt = latestEnergyLevel.UpdatedAt
            };

            return Results.Ok(response);
        })
        .WithName("GetLatestEnergyLevel")
        .WithOpenApi();

        app.MapGet("/energy/{userId}", async (int userId, UserDbContext db) =>
        {
            var energyLevels = await db.EnergyLevels
                .Where(e => e.UserId == userId)
                .OrderByDescending(e => e.RecordedAt)
                .ToListAsync();

            var response = energyLevels.Select(e => new EnergyLevelResponse
            {
                Id = e.Id,
                UserId = e.UserId,
                PhysicalScore = e.PhysicalScore,
                MentalScore = e.MentalScore,
                EmotionalScore = e.EmotionalScore,
                SpiritualScore = e.SpiritualScore,
                OverallScore = e.OverallScore,
                RecordedAt = e.RecordedAt,
                Description = e.Description,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt
            });

            return Results.Ok(response);
        })
        .WithName("GetEnergyLevels")
        .WithOpenApi();

        return app;
    }
}
