using Microsoft.EntityFrameworkCore;
using Shared.DataAccess;
using Authentication.Api.Endpoints;
using UserProfile.Api.Endpoints;
using UserProfile.Services;
using Values.Api.Endpoints;
using Budget.Api.Endpoints;
using Energy.Api.Endpoints;
using Tracker.Api.Endpoints;
using Resources.Api.Endpoints;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

// JSON enum converter to parse string names for enums (e.g. "Wealth" => Value.Wealth)
builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader());
});

// Add custom services
builder.Services.AddScoped<IFileStorageService, FileStorageService>();
builder.Services.AddScoped<IModel3dGenerationService, Model3dGenerationService>();

Directory.CreateDirectory("/app/src/Shared/Databases");
var dbPath = Path.Combine(builder.Environment.ContentRootPath, "src", "Shared", "Databases", "userauth.db");
builder.Services.AddDbContext<UserDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

var app = builder.Build();

// Ensure database is created when the app starts.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<UserDbContext>();
    db.Database.EnsureCreated();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

// Serve static files for uploads from the uploads directory
var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "uploads");
// Ensure uploads directory exists
Directory.CreateDirectory(uploadsPath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = "/api/uploads"
});

// Serve default static files from wwwroot
app.UseStaticFiles();

// Map endpoints from different modules
app.MapAuthenticationEndpoints();
app.MapProfileEndpoints();
app.MapGoalsEndpoints();
app.MapBudgetEndpoints();
app.MapEnergyEndpoints();
app.MapTrackerEndpoints();
app.MapResourcesEndpoints();

app.Run();