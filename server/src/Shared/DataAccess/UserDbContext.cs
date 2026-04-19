using Microsoft.EntityFrameworkCore;
using Budget.Models;
using Shared.Models;
using Energy.Models;
using Tracker.Models;
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
    public DbSet<Income> Incomes => Set<Income>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<EnergyLevel> EnergyLevels => Set<EnergyLevel>();
    public DbSet<DailyTracker> DailyTrackers => Set<DailyTracker>();
    public DbSet<Plan> Plans => Set<Plan>();
}
