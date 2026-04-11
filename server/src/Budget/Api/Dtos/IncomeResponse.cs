using Budget.Models;

namespace Budget.Api.Dtos;

public class IncomeResponse
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal Amount { get; set; }
    public IncomeExpenseType Type { get; set; }
    public Frequency Frequency { get; set; }
    public DateTime Date { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
