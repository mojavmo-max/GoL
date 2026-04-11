import React, { useState } from 'react';
import { createGoal } from '../api/api';
import './GoalForm.css';

const GoalForm = ({ userId, onGoalCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    category: 'NotSpecified',
    description: '',
    colorHex: '#007bff',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const valueOptions = [
    { value: 'NotSpecified', label: 'Not Specified' },
    { value: 'Wealth', label: 'Wealth' },
    { value: 'Fitness', label: 'Fitness' },
    { value: 'Social', label: 'Social' },
    { value: 'Spirit', label: 'Spirit' },
    { value: 'Health', label: 'Health' },
    { value: 'Education', label: 'Education' },
    { value: 'Career', label: 'Career' },
    { value: 'Creativity', label: 'Creativity' },
    { value: 'Family', label: 'Family' },
    { value: 'Adventure', label: 'Adventure' },
    { value: 'Leadership', label: 'Leadership' },
    { value: 'Happiness', label: 'Happiness' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createGoal(userId, formData);
      onGoalCreated();
    } catch (err) {
      setError('Failed to create goal');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="goal-form-overlay">
      <div className="goal-form">
        <h3>Create New Goal</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {valueOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your goal..."
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="colorHex">Color:</label>
            <input
              type="color"
              id="colorHex"
              name="colorHex"
              value={formData.colorHex}
              onChange={handleChange}
            />
          </div>

          {error && <div className="error">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalForm;
