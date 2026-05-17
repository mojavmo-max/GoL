using Microsoft.EntityFrameworkCore;
using Shared.DataAccess;
using Values.Api.Dtos;
using Values.Models;
using Task = Values.Models.Task;
using Status = Values.Models.Status;

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
                Status = v.Status,
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
                Status = goal.Status,
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
                Status = newGoal.Status,
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

            goal.Status = req.Status;
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

        // Get persisted category scores for user
        app.MapGet("/values/{userId}/category-scores", async (int userId, UserDbContext db) =>
        {
            var scores = await db.UserCategoryScores
                .Where(s => s.UserId == userId)
                .OrderBy(s => s.CategoryId)
                .Select(s => new UserCategoryScoreResponse
                {
                    UserId = s.UserId,
                    CategoryId = s.CategoryId,
                    Score = s.Score,
                    LevelNumber = s.LevelNumber
                })
                .ToListAsync();

            return Results.Ok(scores);
        })
        .WithName("GetUserCategoryScores")
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
            var task = await db.Tasks
                .Include(t => t.Goal)
                .FirstOrDefaultAsync(t => t.Id == taskId);
            if (task == null)
                return Results.NotFound("Task not found");

            task.Status = req.Status;
            if (req.Status == Status.Completed)
                task.CompletedAt = DateTime.UtcNow;
            else
                task.CompletedAt = null;

            task.UpdatedAt = DateTime.UtcNow;

            await db.SaveChangesAsync();

            await RecalculateAndPersistUserCategoryScoreAsync(db, task.Goal.UserId, task.Goal.Category);

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
            var task = await db.Tasks
                .Include(t => t.Goal)
                .FirstOrDefaultAsync(t => t.Id == taskId);
            if (task == null)
                return Results.NotFound("Task not found");

            var userId = task.Goal.UserId;
            var category = task.Goal.Category;

            db.Tasks.Remove(task);
            await db.SaveChangesAsync();

            await RecalculateAndPersistUserCategoryScoreAsync(db, userId, category);

            return Results.Ok("Task deleted");
        })
        .WithName("DeleteTask")
        .WithOpenApi();

        // Get task details view for a specific user and category
        app.MapGet("/goals/task-details/{userId:int}/{categoryId:int}", async (int userId, int categoryId, UserDbContext db) =>
        {
            var connection = db.Database.GetDbConnection();
            {
                if (connection.State != System.Data.ConnectionState.Open)
                    await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            GoalId,
                            UserId,
                            Category,
                            GoalDescription,
                            GoalStatus,
                            ColorHex,
                            IsActive,
                            GoalCreatedAt,
                            GoalUpdatedAt,
                            CategoryScore,
                            CategoryLevel,
                            TaskId,
                            TaskName,
                            TaskDescription,
                            TaskStatus,
                            TaskPoints,
                            TaskCompletedAt
                        FROM vwTaskDetails
                        WHERE UserId = @userId AND Category = @categoryId
                        ORDER BY GoalId, TaskCompletedAt DESC";

                    var userIdParam = command.CreateParameter();
                    userIdParam.ParameterName = "@userId";
                    userIdParam.Value = userId;
                    command.Parameters.Add(userIdParam);

                    var categoryIdParam = command.CreateParameter();
                    categoryIdParam.ParameterName = "@categoryId";
                    categoryIdParam.Value = categoryId;
                    command.Parameters.Add(categoryIdParam);

                    var results = new List<TaskDetailsResponse>();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            results.Add(new TaskDetailsResponse
                            {
                                GoalId = reader.GetInt32(0),
                                UserId = reader.GetInt32(1),
                                Category = reader.GetInt32(2),
                                GoalDescription = reader.GetString(3),
                                GoalStatus = reader.GetInt32(4),
                                ColorHex = reader.IsDBNull(5) ? null : reader.GetString(5),
                                IsActive = reader.GetBoolean(6),
                                GoalCreatedAt = reader.GetDateTime(7),
                                GoalUpdatedAt = reader.GetDateTime(8),
                                CategoryScore = reader.GetInt32(9),
                                CategoryLevel = reader.GetInt32(10),
                                TaskId = reader.IsDBNull(11) ? null : reader.GetInt32(11),
                                TaskName = reader.IsDBNull(12) ? null : reader.GetString(12),
                                TaskDescription = reader.IsDBNull(13) ? null : reader.GetString(13),
                                TaskStatus = reader.IsDBNull(14) ? null : reader.GetInt32(14),
                                TaskPoints = reader.IsDBNull(15) ? null : reader.GetInt32(15),
                                TaskCompletedAt = reader.IsDBNull(16) ? null : reader.GetDateTime(16)
                            });
                        }
                    }

                    return Results.Ok(results);
                }
            }
        })
        .WithName("GetTaskDetails")
        .WithOpenApi();

        return app;
    }

    private static async System.Threading.Tasks.Task RecalculateAndPersistUserCategoryScoreAsync(UserDbContext db, int userId, Value category)
    {
        var totalScore = await db.Tasks
            .Where(t => t.Goal.UserId == userId
                     && t.Goal.Category == category
                     && t.Status == Status.Completed)
            .SumAsync(t => (int?)t.Points) ?? 0;

        var levelNumber = CalculateLevelNumber(totalScore);
        var currentLevelScore = CalculateScoreWithinCurrentLevel(totalScore, levelNumber);
        var categoryId = (int)category;

        var existingScore = await db.UserCategoryScores
            .FirstOrDefaultAsync(s => s.UserId == userId && s.CategoryId == categoryId);

        if (existingScore == null)
        {
            db.UserCategoryScores.Add(new UserCategoryScore
            {
                UserId = userId,
                CategoryId = categoryId,
                Score = currentLevelScore,
                LevelNumber = levelNumber
            });
        }
        else
        {
            existingScore.Score = currentLevelScore;
            existingScore.LevelNumber = levelNumber;
        }

        await db.SaveChangesAsync();
    }

    private static int CalculateLevelNumber(int score)
    {
        if (score <= 0)
            return 0;

        // XP_n = 50 * n^1.4, solve n from current score and floor to the attained level.
        return (int)Math.Floor(Math.Pow(score / 50.0, 1.0 / 1.4));
    }

    private static int CalculateScoreWithinCurrentLevel(int totalScore, int currentLevel)
    {
        var currentLevelMinimumXp = CalculateMinimumXpForLevel(currentLevel);
        return Math.Max(0, totalScore - currentLevelMinimumXp);
    }

    private static int CalculateMinimumXpForLevel(int level)
    {
        if (level <= 0)
            return 0;

        // Use the integer minimum XP needed to reach the requested level.
        return (int)Math.Ceiling(50 * Math.Pow(level, 1.4));
    }
}
