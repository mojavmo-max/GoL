namespace Budget.Api.Dtos;

public class BudgetSummaryResponse
{
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetBudget { get; set; }
    public bool CurrentMonthOnly { get; set; }
    public DateTime? PeriodStart { get; set; }
    public DateTime? PeriodEnd { get; set; }
    public IEnumerable<IncomeResponse> Incomes { get; set; } = Array.Empty<IncomeResponse>();
    public IEnumerable<ExpenseResponse> Expenses { get; set; } = Array.Empty<ExpenseResponse>();
}
