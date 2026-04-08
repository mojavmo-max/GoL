using Microsoft.EntityFrameworkCore;
using UserProfile.Api.Dtos;
using Shared.DataAccess;
using UserProfile.Services;

namespace UserProfile.Api.Endpoints;

public static class ProfileHandler
{
    public static WebApplication MapProfileEndpoints(this WebApplication app)
    {
        // Profile endpoints
        app.MapGet("/profile/{userId}", async (int userId, UserDbContext db, IFileStorageService fileService) =>
        {
            var user = await db.Users.FindAsync(userId);
            if (user == null)
                return Results.NotFound("User not found.");

            var response = new UserProfileResponse
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                CharacterName = user.CharacterName,
                Age = user.Age,
                Salary = user.Salary,
                RelationshipStatus = user.RelationshipStatus,
                AvatarPhotoUrl = fileService.GetAvatarUrl(user.AvatarPhotoPath ?? ""),
                Model3dUrl = user.Model3dPath,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };

            return Results.Ok(response);
        })
        .WithName("GetUserProfile")
        .WithOpenApi();

        app.MapPut("/profile/{userId}", async (int userId, UserProfileRequest req, UserDbContext db) =>
        {
            var user = await db.Users.FindAsync(userId);
            if (user == null)
                return Results.NotFound("User not found.");

            // Update profile fields
            if (!string.IsNullOrWhiteSpace(req.FirstName))
                user.FirstName = req.FirstName;
            if (!string.IsNullOrWhiteSpace(req.LastName))
                user.LastName = req.LastName;
            if (!string.IsNullOrWhiteSpace(req.CharacterName))
                user.CharacterName = req.CharacterName;
            if (req.Age.HasValue)
                user.Age = req.Age;
            if (req.Salary.HasValue)
                user.Salary = req.Salary;
            if (!string.IsNullOrWhiteSpace(req.RelationshipStatus))
                user.RelationshipStatus = req.RelationshipStatus;

            user.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();

            return Results.Ok(new { user.Id, user.Email, user.FirstName, user.LastName, user.CharacterName });
        })
        .WithName("UpdateUserProfile")
        .WithOpenApi();

        // Avatar upload endpoint
        app.MapPost("/profile/{userId}/avatar", async (int userId, HttpRequest request, UserDbContext db, 
            IFileStorageService fileService, IModel3dGenerationService model3dService) =>
        {
            var user = await db.Users.FindAsync(userId);
            if (user == null)
                return Results.NotFound("User not found.");

            if (!request.HasFormContentType)
                return Results.BadRequest("Request must contain form data with file upload.");

            var form = await request.ReadFormAsync();
            var file = form.Files.FirstOrDefault();

            if (file == null || file.Length == 0)
                return Results.BadRequest("No file uploaded.");

            // Validate file type (only images)
            var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            if (!allowedTypes.Contains(file.ContentType))
                return Results.BadRequest("Only image files are allowed (JPEG, PNG, GIF, WebP).");

            try
            {
                // Delete old avatar if exists
                if (!string.IsNullOrEmpty(user.AvatarPhotoPath))
                {
                    await fileService.DeleteAvatarAsync(user.AvatarPhotoPath);
                }

                // Save new avatar
                using var stream = file.OpenReadStream();
                var savedPath = await fileService.SaveAvatarAsync(stream, file.FileName, userId);
                user.AvatarPhotoPath = savedPath;

                // Generate 3D model (placeholder - actual generation can be done on client or via external service)
                var model3dPath = await model3dService.GenerateModel3dAsync(savedPath, userId);
                if (!string.IsNullOrEmpty(model3dPath))
                {
                    user.Model3dPath = model3dPath;
                }

                user.UpdatedAt = DateTime.UtcNow;
                await db.SaveChangesAsync();

                var response = new AvatarUploadResponse
                {
                    Message = "Avatar uploaded successfully",
                    AvatarUrl = fileService.GetAvatarUrl(savedPath),
                    Model3dGenerationUrl = model3dPath
                };

                return Results.Ok(response);
            }
            catch (Exception ex)
            {
                return Results.BadRequest($"Error uploading avatar: {ex.Message}");
            }
        })
        .WithName("UploadAvatar")
        .WithOpenApi()
        .Accepts<IFormFile>("multipart/form-data");

        // Delete avatar endpoint
        app.MapDelete("/profile/{userId}/avatar", async (int userId, UserDbContext db, IFileStorageService fileService) =>
        {
            var user = await db.Users.FindAsync(userId);
            if (user == null)
                return Results.NotFound("User not found.");

            if (string.IsNullOrEmpty(user.AvatarPhotoPath))
                return Results.BadRequest("User does not have an avatar.");

            try
            {
                await fileService.DeleteAvatarAsync(user.AvatarPhotoPath);
                user.AvatarPhotoPath = null;
                user.Model3dPath = null;
                user.UpdatedAt = DateTime.UtcNow;
                await db.SaveChangesAsync();

                return Results.Ok(new { Message = "Avatar deleted successfully" });
            }
            catch (Exception ex)
            {
                return Results.BadRequest($"Error deleting avatar: {ex.Message}");
            }
        })
        .WithName("DeleteAvatar")
        .WithOpenApi();

        return app;
    }
}
