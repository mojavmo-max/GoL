using Microsoft.EntityFrameworkCore;
using Authentication.Api.Dtos;
using Shared.DataAccess;
using Shared.Models;
using Authentication.Services;

namespace Authentication.Api.Endpoints;

public static class AuthHandler
{
    public static WebApplication MapAuthenticationEndpoints(this WebApplication app)
    {
        app.MapPost("/auth/register", async (RegisterRequest req, UserDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
                return Results.BadRequest("Email and password are required.");

            var exists = await db.Users.AnyAsync(u => u.Email == req.Email);
            if (exists)
                return Results.Conflict("Email already registered.");

            var (hash, salt) = PasswordHasher.HashPassword(req.Password);
            var user = new User { Email = req.Email, PasswordHash = hash, PasswordSalt = salt };

            db.Users.Add(user);
            await db.SaveChangesAsync();

            return Results.Created($"/auth/users/{user.Id}", new { user.Id, user.Email });
        })
        .WithName("RegisterUser")
        .WithOpenApi();

        app.MapPost("/auth/login", async (LoginRequest req, UserDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
                return Results.BadRequest("Email and password are required.");

            var user = await db.Users.SingleOrDefaultAsync(u => u.Email == req.Email);
            if (user == null)
                return Results.Unauthorized();

            var valid = PasswordHasher.VerifyPassword(req.Password, user.PasswordHash, user.PasswordSalt);
            if (!valid)
                return Results.Unauthorized();

            return Results.Ok(new { user.Id, user.Email, Token = "<token-placeholder>" });
        })
        .WithName("LoginUser")
        .WithOpenApi();

        app.MapGet("/auth/users", async (UserDbContext db) =>
        {
            var users = await db.Users.Select(u => new { u.Id, u.Email }).ToListAsync();
            return Results.Ok(users);
        })
        .WithName("ListUsers")
        .WithOpenApi();

        return app;
    }
}
