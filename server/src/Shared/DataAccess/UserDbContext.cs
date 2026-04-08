using Microsoft.EntityFrameworkCore;
using Shared.Models;
using Values.Models;
using Task = Values.Models.Task;

namespace Shared.DataAccess;

public class UserDbContext : DbContext
{
    public UserDbContext(DbContextOptions<UserDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Goal> Goals => Set<Goal>();
    public DbSet<Task> Tasks => Set<Task>();
}
