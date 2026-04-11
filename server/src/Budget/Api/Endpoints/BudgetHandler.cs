using Budget.Api.Dtos;
using Budget.Models;
using Microsoft.EntityFrameworkCore;
using Shared.DataAccess;

namespace Budget.Api.Endpoints;

public static class BudgetHandler
{
    public static WebApplication MapBudgetEndpoints(this WebApplication app)
    {
        app.MapPost("/budget/{userId}/income", async (int userId, CreateIncomeRequest req, UserDbContext db) =>
        {
            if (req.Amount <= 0)
                return Results.BadRequest("Amount must be greater than zero.");

            if (string.IsNullOrWhiteSpace(req.Name))
                return Results.BadRequest("Name is required.");

            var income = new Income
            {
                UserId = userId,
                Amount = req.Amount,
                Type = req.Type,
                Frequency = req.Frequency,
                Date = req.Date,
                Name = req.Name,
                Description = req.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            db.Incomes.Add(income);
            await db.SaveChangesAsync();

            var response = new IncomeResponse
            {
                Id = income.Id,
                UserId = income.UserId,
                Amount = income.Amount,
                Type = income.Type,
                Frequency = income.Frequency,
                Date = income.Date,
                Name = income.Name,
                Description = income.Description,
                CreatedAt = income.CreatedAt,
                UpdatedAt = income.UpdatedAt
            };

            return Results.Created($"/budget/{userId}/income/{income.Id}", response);
        })
        .WithName("CreateIncome")
        .WithOpenApi();

        app.MapGet("/budget/{userId}/incomes", async (int userId, UserDbContext db) =>
        {
            var incomes = await db.Incomes
                .Where(i => i.UserId == userId)
                .OrderByDescending(i => i.Date)
                .ToListAsync();

            var response = incomes.Select(i => new IncomeResponse
            {
                Id = i.Id,
                UserId = i.UserId,
                Amount = i.Amount,
                Type = i.Type,
                Frequency = i.Frequency,
                Date = i.Date,
                Name = i.Name,
                Description = i.Description,
                CreatedAt = i.CreatedAt,
                UpdatedAt = i.UpdatedAt
            });

            return Results.Ok(response);
        })
        .WithName("GetIncomes")
        .WithOpenApi();

        app.MapPost("/budget/{userId}/expense", async (int userId, CreateExpenseRequest req, UserDbContext db) =>
        {
            if (req.Amount <= 0)
                return Results.BadRequest("Amount must be greater than zero.");

            if (string.IsNullOrWhiteSpace(req.Name))
                return Results.BadRequest("Name is required.");

            var expense = new Expense
            {
                UserId = userId,
                Amount = req.Amount,
                Type = req.Type,
                Frequency = req.Frequency,
                Date = req.Date,
                Name = req.Name,
                Description = req.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            db.Expenses.Add(expense);
            await db.SaveChangesAsync();

            var response = new ExpenseResponse
            {
                Id = expense.Id,
                UserId = expense.UserId,
                Amount = expense.Amount,
                Type = expense.Type,
                Frequency = expense.Frequency,
                Date = expense.Date,
                Name = expense.Name,
                Description = expense.Description,
                CreatedAt = expense.CreatedAt,
                UpdatedAt = expense.UpdatedAt
            };

            return Results.Created($"/budget/{userId}/expense/{expense.Id}", response);
        })
        .WithName("CreateExpense")
        .WithOpenApi();

        app.MapGet("/budget/{userId}/expenses", async (int userId, UserDbContext db) =>
        {
            var expenses = await db.Expenses
                .Where(e => e.UserId == userId)
                .OrderByDescending(e => e.Date)
                .ToListAsync();

            var response = expenses.Select(e => new ExpenseResponse
            {
                Id = e.Id,
                UserId = e.UserId,
                Amount = e.Amount,
                Type = e.Type,
                Frequency = e.Frequency,
                Date = e.Date,
                Name = e.Name,
                Description = e.Description,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt
            });

            return Results.Ok(response);
        })
        .WithName("GetExpenses")
        .WithOpenApi();

        app.MapGet("/budget/{userId}/summary", async (int userId, DateTime? date, bool currentMonth, UserDbContext db) =>
        {
            if (currentMonth && date == null)
                return Results.BadRequest("A date is required when currentMonth is true.");

            var incomesQuery = db.Incomes.Where(i => i.UserId == userId);
            var expensesQuery = db.Expenses.Where(e => e.UserId == userId);
            DateTime? periodStart = null;
            DateTime? periodEnd = null;

            if (currentMonth && date.HasValue)
            {
                var target = date.Value;
                var monthStart = new DateTime(target.Year, target.Month, 1);
                var monthEnd = monthStart.AddMonths(1);
                incomesQuery = incomesQuery.Where(i => i.Date >= monthStart && i.Date < monthEnd);
                expensesQuery = expensesQuery.Where(e => e.Date >= monthStart && e.Date < monthEnd);
                periodStart = monthStart;
                periodEnd = monthEnd.AddTicks(-1);
            }

            var incomes = await incomesQuery.OrderByDescending(i => i.Date).ToListAsync();
            var expenses = await expensesQuery.OrderByDescending(e => e.Date).ToListAsync();
            var totalIncome = incomes.Sum(i => i.Amount);
            var totalExpenses = expenses.Sum(e => e.Amount);

            var response = new BudgetSummaryResponse
            {
                TotalIncome = totalIncome,
                TotalExpenses = totalExpenses,
                NetBudget = totalIncome - totalExpenses,
                CurrentMonthOnly = currentMonth,
                PeriodStart = periodStart,
                PeriodEnd = periodEnd,
                Incomes = incomes.Select(i => new IncomeResponse
                {
                    Id = i.Id,
                    UserId = i.UserId,
                    Amount = i.Amount,
                    Type = i.Type,
                    Frequency = i.Frequency,
                    Date = i.Date,
                    Name = i.Name,
                    Description = i.Description,
                    CreatedAt = i.CreatedAt,
                    UpdatedAt = i.UpdatedAt
                }).ToList(),
                Expenses = expenses.Select(e => new ExpenseResponse
                {
                    Id = e.Id,
                    UserId = e.UserId,
                    Amount = e.Amount,
                    Type = e.Type,
                    Frequency = e.Frequency,
                    Date = e.Date,
                    Name = e.Name,
                    Description = e.Description,
                    CreatedAt = e.CreatedAt,
                    UpdatedAt = e.UpdatedAt
                }).ToList()
            };

            return Results.Ok(response);
        })
        .WithName("GetBudgetSummary")
        .WithOpenApi();

        return app;
    }
}
