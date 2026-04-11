using Budget.Models;

namespace Budget.Api.Dtos;

public class CreateExpenseRequest
{
    public decimal Amount { get; set; }
    public IncomeExpenseType Type { get; set; }
    public Frequency Frequency { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
