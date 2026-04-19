using Microsoft.EntityFrameworkCore;
using Shared.DataAccess;
using Tracker.Api.Dtos;
using Tracker.Models;

namespace Tracker.Api.Endpoints;

public static class TrackerHandler
{
    public static WebApplication MapTrackerEndpoints(this WebApplication app)
    {
        app.MapGet("/tracker/{userId}/{date}", async (int userId, string date, UserDbContext db) =>
        {
            if (!DateTime.TryParse(date, out var trackerDate))
                return Results.BadRequest("Invalid date format.");

            trackerDate = trackerDate.Date;

            var tracker = await db.DailyTrackers
                .Include(t => t.Plans)
                .FirstOrDefaultAsync(t => t.UserId == userId && t.Date == trackerDate);

            if (tracker == null)
                return Results.NotFound("No tracker found for the requested date.");

            var response = new DailyTrackerResponse
            {
                Id = tracker.Id,
                UserId = tracker.UserId,
                Date = tracker.Date,
                CreatedAt = tracker.CreatedAt,
                UpdatedAt = tracker.UpdatedAt,
                Plans = tracker.Plans.Select(p => new PlanResponse
                {
                    Id = p.Id,
                    Date = p.Date,
                    Time = p.Time,
                    Description = p.Description,
                    IsCompleted = p.IsCompleted,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                }).ToList()
            };

            return Results.Ok(response);
        })
        .WithName("GetDailyTracker")
        .WithOpenApi();

        app.MapPost("/tracker/{userId}", async (int userId, DailyTrackerRequest req, UserDbContext db) =>
        {
            var trackerDate = req.Date.Date;

            var existingTracker = await db.DailyTrackers
                .Include(t => t.Plans)
                .FirstOrDefaultAsync(t => t.UserId == userId && t.Date == trackerDate);

            if (existingTracker != null)
            {
                db.Plans.RemoveRange(existingTracker.Plans);
                existingTracker.Plans = req.Plans.Select(p => new Plan
                {
                    Date = p.Date,
                    Time = p.Time,
                    Description = p.Description,
                    IsCompleted = p.IsCompleted,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }).ToList();
                existingTracker.UpdatedAt = DateTime.UtcNow;
                await db.SaveChangesAsync();

                var updatedResponse = new DailyTrackerResponse
                {
                    Id = existingTracker.Id,
                    UserId = existingTracker.UserId,
                    Date = existingTracker.Date,
                    CreatedAt = existingTracker.CreatedAt,
                    UpdatedAt = existingTracker.UpdatedAt,
                    Plans = existingTracker.Plans.Select(p => new PlanResponse
                    {
                        Id = p.Id,
                        Date = p.Date,
                        Time = p.Time,
                        Description = p.Description,
                        IsCompleted = p.IsCompleted,
                        CreatedAt = p.CreatedAt,
                        UpdatedAt = p.UpdatedAt
                    }).ToList()
                };

                return Results.Ok(updatedResponse);
            }

            var tracker = new DailyTracker
            {
                UserId = userId,
                Date = trackerDate,
                Plans = req.Plans.Select(p => new Plan
                {
                    Date = p.Date,
                    Time = p.Time,
                    Description = p.Description,
                    IsCompleted = p.IsCompleted,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }).ToList(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            db.DailyTrackers.Add(tracker);
            await db.SaveChangesAsync();

            var response = new DailyTrackerResponse
            {
                Id = tracker.Id,
                UserId = tracker.UserId,
                Date = tracker.Date,
                CreatedAt = tracker.CreatedAt,
                UpdatedAt = tracker.UpdatedAt,
                Plans = tracker.Plans.Select(p => new PlanResponse
                {
                    Id = p.Id,
                    Date = p.Date,
                    Time = p.Time,
                    Description = p.Description,
                    IsCompleted = p.IsCompleted,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                }).ToList()
            };

            return Results.Created($"/tracker/{userId}/{tracker.Date:yyyy-MM-dd}", response);
        })
        .WithName("SaveDailyTracker")
        .WithOpenApi();

        return app;
    }
}
