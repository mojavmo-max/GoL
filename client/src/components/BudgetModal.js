import { useState, useEffect } from 'react';
import { getBudgetSummary, createIncome, createExpense } from '../api/api';
import './BudgetModal.css';

function BudgetModal({
  userId,
  onClose,
  currentNetBudget,
  onBudgetPreviewChange,
  onBudgetSaved,
}) {
  const [viewType, setViewType] = useState('monthly'); // 'monthly' or 'overall'
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState(null); // 'income' or 'expense'
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: 'Regular',
    frequency: 'Daily',
    date: new Date().toISOString().slice(0, 10),
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBudgetData = async () => {
      setLoading(true);
      try {
        const data = await getBudgetSummary(
          userId,
          new Date(),
          viewType === 'monthly',
        );
        setBudgetData(data);
      } catch (error) {
        console.error('Failed to fetch budget data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, [viewType, userId]);

  const handleAddButtonClick = (type) => {
    setFormType(type);
    setShowForm(true);
    setFormData({
      name: '',
      amount: '',
      type: 'Regular',
      frequency: 'Daily',
      date: new Date().toISOString().slice(0, 10),
      description: '',
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (!onBudgetPreviewChange) {
      return;
    }

    if (!showForm || !formType) {
      onBudgetPreviewChange(null);
      return;
    }

    const amount = parseFloat(formData.amount);
    if (!Number.isFinite(amount)) {
      onBudgetPreviewChange(currentNetBudget);
      return;
    }

    const preview =
      formType === 'income'
        ? currentNetBudget + amount
        : currentNetBudget - amount;
    onBudgetPreviewChange(preview);
  }, [
    formData.amount,
    formType,
    currentNetBudget,
    showForm,
    onBudgetPreviewChange,
  ]);

  useEffect(() => {
    return () => {
      onBudgetPreviewChange?.(null);
    };
  }, [onBudgetPreviewChange]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        type: formData.type,
        frequency: formData.frequency,
        description: formData.description,
        date: formData.date
          ? new Date(formData.date).toISOString()
          : new Date().toISOString(),
      };

      if (formType === 'income') {
        await createIncome(userId, payload);
      } else {
        await createExpense(userId, payload);
      }

      onBudgetSaved?.(formType, parseFloat(formData.amount));

      // Refresh budget data
      const updatedData = await getBudgetSummary(
        userId,
        new Date(),
        viewType === 'monthly',
      );
      setBudgetData(updatedData);

      // Reset form
      setShowForm(false);
      setFormType(null);
      setFormData({
        name: '',
        amount: '',
        type: 'Regular',
        frequency: 'Daily',
        date: new Date().toISOString().slice(0, 10),
        description: '',
      });
    } catch (error) {
      console.error('Failed to add', formType, ':', error);
      alert(`Failed to add ${formType}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Budget Details</h2>
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="modal-body">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {showForm && (
            <button
              className="back-btn"
              onClick={() => setShowForm(false)}
              aria-label="Back to budget"
            >
              ← Back
            </button>
          )}
          <h2>Budget Details</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {showForm ? (
            <div className="add-form-container">
              <h3>{formType === 'income' ? 'Add Income' : 'Add Expense'}</h3>
              <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder={
                      formType === 'income' ? 'e.g., Salary' : 'e.g., Groceries'
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="amount">Amount *</label>
                  <input
                    id="amount"
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleFormChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">Type</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                  >
                    <option value="OneOff">One-Off</option>
                    <option value="Regular">Regular</option>
                  </select>
                </div>

                {formData.type === 'Regular' && (
                  <div className="form-group">
                    <label htmlFor="frequency">Frequency</label>
                    <select
                      id="frequency"
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleFormChange}
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Fortnightly">Fortnightly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    id="date"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Optional notes"
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="submit-btn"
                  >
                    {submitting ? 'Saving...' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {budgetData && (
                <div className="budget-summary">
                  <div className="summary-item">
                    <span>Total Income:</span>
                    <span className="income-amount">
                      ${budgetData.totalIncome.toFixed(2)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span>Total Expenses:</span>
                    <span className="expense-amount">
                      (${budgetData.totalExpenses.toFixed(2)})
                    </span>
                  </div>
                  <div className="summary-item net-budget">
                    <span>Net Budget:</span>
                    <span
                      className={
                        budgetData.netBudget >= 0
                          ? 'income-amount'
                          : 'expense-amount'
                      }
                    >
                      {budgetData.netBudget >= 0 ? '$' : '($'}
                      {Math.abs(budgetData.netBudget).toFixed(2)}
                      {budgetData.netBudget < 0 ? ')' : ''}
                    </span>
                  </div>
                </div>
              )}

              <div className="view-toggle">
                <span className="toggle-label">Monthly</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={viewType === 'overall'}
                    onChange={(e) =>
                      setViewType(e.target.checked ? 'overall' : 'monthly')
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className="toggle-label">Overall</span>
              </div>

              <div className="breakdown">
                <div className="income-breakdown">
                  <div className="section-header">
                    <h3>Incomes</h3>
                    <button
                      className="add-btn add-income-btn"
                      onClick={() => handleAddButtonClick('income')}
                    >
                      + Add Income
                    </button>
                  </div>
                  {budgetData?.incomes?.length > 0 ? (
                    <ul>
                      {budgetData.incomes.map((income) => (
                        <li key={income.id}>
                          <span className="item-name">{income.name}</span>
                          <span className="income-amount">
                            ${income.amount.toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No incomes recorded.</p>
                  )}
                </div>

                <div className="expense-breakdown">
                  <div className="section-header">
                    <h3>Expenses</h3>
                    <button
                      className="add-btn add-expense-btn"
                      onClick={() => handleAddButtonClick('expense')}
                    >
                      + Add Expense
                    </button>
                  </div>
                  {budgetData?.expenses?.length > 0 ? (
                    <ul>
                      {budgetData.expenses.map((expense) => (
                        <li key={expense.id}>
                          <span className="item-name">{expense.name}</span>
                          <span className="expense-amount">
                            (${expense.amount.toFixed(2)})
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No expenses recorded.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BudgetModal;
