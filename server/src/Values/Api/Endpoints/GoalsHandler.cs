using Microsoft.EntityFrameworkCore;
using Shared.DataAccess;
using Values.Api.Dtos;
using Values.Models;
using Task = Values.Models.Task;
using TaskStatus = Values.Models.TaskStatus;

namespace Values.Api.Endpoints;

public static class GoalsHandler
{
    public static WebApplication MapGoalsEndpoints(this WebApplication app)
    {
        // ===== GOALS ENDPOINTS =====
        
        // Get all goals for user
        app.MapGet("/goals/{userId}", async (int userId, UserDbContext db) =>
        {
            var goals = await db.Goals
                .Where(v => v.UserId == userId)
                .OrderBy(v => v.Category)
                .ToListAsync();

            var response = goals.Select(v => new GoalResponse
            {
                Id = v.Id,
                UserId = v.UserId,
                Category = v.Category,
                Description = v.Description,
                ProgressScore = v.ProgressScore,
                ColorHex = v.ColorHex,
                IsActive = v.IsActive,
                CreatedAt = v.CreatedAt,
                UpdatedAt = v.UpdatedAt,
                Tasks = new List<TaskResponse>() // Empty list since we're not including tasks
            }).ToList();

            return Results.Ok(response);
        })
        .WithName("GetUserGoals")
        .WithOpenApi();

        // Get single goal
        app.MapGet("/goals/{userId}/{goalId}", async (int userId, int goalId, UserDbContext db) =>
        {
            var goal = await db.Goals
                .Where(v => v.UserId == userId && v.Id == goalId)
                .Include(v => v.Tasks)
                .FirstOrDefaultAsync();

            if (goal == null)
                return Results.NotFound("Goal not found");

            var response = new GoalResponse
            {
                Id = goal.Id,
                UserId = goal.UserId,
                Category = goal.Category,
                Description = goal.Description,
                ProgressScore = goal.ProgressScore,
                ColorHex = goal.ColorHex,
                IsActive = goal.IsActive,
                CreatedAt = goal.CreatedAt,
                UpdatedAt = goal.UpdatedAt,
                Tasks = goal.Tasks.Select(t => new TaskResponse
                {
                    Id = t.Id,
                    GoalId = t.GoalId,
                    Title = t.Title,
                    Description = t.Description,
                    Status = t.Status,
                    Points = t.Points,
                    Priority = t.Priority,
                    DueDate = t.DueDate,
                    CompletedAt = t.CompletedAt,
                    Frequency = t.Frequency,
                    FrequencyType = t.FrequencyType,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt
                }).ToList()
            };

            return Results.Ok(response);
        })
        .WithName("GetGoal")
        .WithOpenApi();

        // Create goal
        app.MapPost("/goals/{userId}", async (int userId, CreateGoalRequest req, UserDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(req.Description))
                return Results.BadRequest("Description is required");

            var newGoal = new Goal
            {
                UserId = userId,
                Category = req.Category,
                Description = req.Description,
                ColorHex = req.ColorHex,
                IsActive = true
            };

            db.Goals.Add(newGoal);
            await db.SaveChangesAsync();

            return Results.Created($"/goals/{userId}/{newGoal.Id}", new GoalResponse
            {
                Id = newGoal.Id,
                UserId = newGoal.UserId,
                Category = newGoal.Category,
                Description = newGoal.Description,
                ProgressScore = newGoal.ProgressScore,
                IsActive = newGoal.IsActive
            });
        })
        .WithName("CreateGoal")
        .WithOpenApi();

        // Update goal progress
        app.MapPut("/goals/{userId}/{goalId}", async (int userId, int goalId, GoalResponse req, UserDbContext db) =>
        {
            var goal = await db.Goals.FirstOrDefaultAsync(v => v.UserId == userId && v.Id == goalId);
            if (goal == null)
                return Results.NotFound("Goal not found");

            goal.ProgressScore = req.ProgressScore;
            goal.Description = req.Description;
            goal.IsActive = req.IsActive;
            goal.UpdatedAt = DateTime.UtcNow;

            await db.SaveChangesAsync();
            return Results.Ok("Goal updated");
        })
        .WithName("UpdateGoal")
        .WithOpenApi();

        // Delete goal
        app.MapDelete("/goals/{userId}/{goalId}", async (int userId, int goalId, UserDbContext db) =>
        {
            var goal = await db.Goals.FirstOrDefaultAsync(v => v.UserId == userId && v.Id == goalId);
            if (goal == null)
                return Results.NotFound("Goal not found");

            db.Goals.Remove(goal);
            await db.SaveChangesAsync();
            return Results.Ok("Goal deleted");
        })
        .WithName("DeleteGoal")
        .WithOpenApi();

        // ===== TASK ENDPOINTS =====

        // Create task
        app.MapPost("/goals/task/create", async (CreateTaskRequest req, UserDbContext db) =>
        {
            var goal = await db.Goals.FirstOrDefaultAsync(v => v.Id == req.GoalId);
            if (goal == null)
                return Results.NotFound("Goal not found");

            var newTask = new Task
            {
                GoalId = req.GoalId,
                Title = req.Title,
                Description = req.Description,
                Points = req.Points,
                Priority = req.Priority,
                DueDate = req.DueDate,
                Frequency = req.Frequency,
                FrequencyType = req.FrequencyType
            };

            db.Tasks.Add(newTask);
            await db.SaveChangesAsync();

            return Results.Created($"/goals/task/{newTask.Id}", new TaskResponse
            {
                Id = newTask.Id,
                GoalId = newTask.GoalId,
                Title = newTask.Title,
                Description = newTask.Description,
                Status = newTask.Status,
                Points = newTask.Points
            });
        })
        .WithName("CreateTask")
        .WithOpenApi();

        // Update task status
        app.MapPut("/goals/task/{taskId}/status", async (int taskId, UpdateTaskStatusRequest req, UserDbContext db) =>
        {
            var task = await db.Tasks.FirstOrDefaultAsync(t => t.Id == taskId);
            if (task == null)
                return Results.NotFound("Task not found");

            task.Status = req.Status;
            if (req.Status == TaskStatus.Completed)
                task.CompletedAt = DateTime.UtcNow;
            task.UpdatedAt = DateTime.UtcNow;

            await db.SaveChangesAsync();
            return Results.Ok("Task status updated");
        })
        .WithName("UpdateTaskStatus")
        .WithOpenApi();

        // Get task
        app.MapGet("/goals/task/{taskId}", async (int taskId, UserDbContext db) =>
        {
            var task = await db.Tasks
                .Include(t => t.Goal)
                .FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null)
                return Results.NotFound("Task not found");

            return Results.Ok(new TaskResponse
            {
                Id = task.Id,
                GoalId = task.GoalId,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status,
                Points = task.Points,
                Priority = task.Priority,
                DueDate = task.DueDate,
                CompletedAt = task.CompletedAt,
                Frequency = task.Frequency,
                FrequencyType = task.FrequencyType,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt
            });
        })
        .WithName("GetTask")
        .WithOpenApi();

        // Delete task
        app.MapDelete("/goals/task/{taskId}", async (int taskId, UserDbContext db) =>
        {
            var task = await db.Tasks.FirstOrDefaultAsync(t => t.Id == taskId);
            if (task == null)
                return Results.NotFound("Task not found");

            db.Tasks.Remove(task);
            await db.SaveChangesAsync();
            return Results.Ok("Task deleted");
        })
        .WithName("DeleteTask")
        .WithOpenApi();

        // ===== ENERGY LEVEL ENDPOINTS =====

        // Create energy level
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

            // Calculate overall score as average of non-null values
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

        // Get latest energy level for user
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

        // Get all energy levels for user
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
