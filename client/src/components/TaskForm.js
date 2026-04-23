import React, { useState, useEffect } from 'react';
import { createTask, getGoals, createGoal } from '../api/api';
import './TaskForm.css';

const TaskForm = ({ goalId, userId, onTaskCreated, onCancel }) => {
  const [goals, setGoals] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState(goalId || '');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalFormData, setGoalFormData] = useState({
    category: 'NotSpecified',
    description: '',
    colorHex: '#007bff',
  });
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    points: 10,
    priority: 1,
    dueDate: '',
    frequency: 1,
    frequencyType: 'weekly',
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

  const loadGoals = useCallback(async () => {
    try {
      const goalsData = await getGoals(userId);
      setGoals(goalsData);
    } catch (err) {
      console.error('Failed to load goals:', err);
    }
  }, [userId]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleTaskChange = (e) => {
    const { name, value } = e.target;
    setTaskFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoalChange = (e) => {
    const { name, value } = e.target;
    setGoalFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoalSelect = (e) => {
    const value = e.target.value;
    if (value === 'create-new') {
      setShowGoalForm(true);
      setSelectedGoalId('');
    } else {
      setSelectedGoalId(value);
      setShowGoalForm(false);
    }
  };

  const handleCreateGoalAndTask = async (e) => {
    e.preventDefault();

    // Validate goal form
    if (!goalFormData.description.trim()) {
      setError('Goal description is required');
      return;
    }

    // Validate task form
    if (!taskFormData.title.trim() || !taskFormData.description.trim()) {
      setError('Task title and description are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create the goal first
      const newGoal = await createGoal(userId, goalFormData);

      // Then create the task with the new goal ID
      await createTask({
        ...taskFormData,
        goalId: newGoal.id,
        dueDate: taskFormData.dueDate || null,
      });

      onTaskCreated();
    } catch (err) {
      setError('Failed to create goal and task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTaskOnly = async (e) => {
    e.preventDefault();

    if (!taskFormData.title.trim() || !taskFormData.description.trim()) {
      setError('Task title and description are required');
      return;
    }

    if (!selectedGoalId) {
      setError('Please select a goal');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createTask({
        ...taskFormData,
        goalId: parseInt(selectedGoalId),
        dueDate: taskFormData.dueDate || null,
      });

      onTaskCreated();
    } catch (err) {
      setError('Failed to create task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getGoalsByCategory = () => {
    const goalsByCategory = {};
    goals.forEach((goal) => {
      if (!goalsByCategory[goal.category]) {
        goalsByCategory[goal.category] = [];
      }
      goalsByCategory[goal.category].push(goal);
    });
    return goalsByCategory;
  };

  const goalsByCategory = getGoalsByCategory();

  return (
    <div className="task-form-overlay">
      <div className="task-form">
        <h3>Create New Task</h3>

        {!showGoalForm ? (
          <form onSubmit={handleCreateTaskOnly}>
            <div className="form-group">
              <label htmlFor="goalSelect">Select Goal:</label>
              <select
                id="goalSelect"
                value={selectedGoalId}
                onChange={handleGoalSelect}
                required
              >
                <option value="">Choose a goal...</option>
                {Object.entries(goalsByCategory).map(
                  ([category, categoryGoals]) => (
                    <optgroup key={category} label={category}>
                      {categoryGoals.map((goal) => (
                        <option key={goal.id} value={goal.id}>
                          {goal.description}
                        </option>
                      ))}
                    </optgroup>
                  ),
                )}
                <option value="create-new">+ Create new goal</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="title">Task Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={taskFormData.title}
                onChange={handleTaskChange}
                placeholder="What needs to be done?"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Task Description:</label>
              <textarea
                id="description"
                name="description"
                value={taskFormData.description}
                onChange={handleTaskChange}
                placeholder="Describe the task..."
                rows="3"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="points">Points:</label>
                <input
                  type="number"
                  id="points"
                  name="points"
                  value={taskFormData.points}
                  onChange={handleTaskChange}
                  min="1"
                  max="100"
                />
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority:</label>
                <input
                  type="number"
                  id="priority"
                  name="priority"
                  value={taskFormData.priority}
                  onChange={handleTaskChange}
                  min="1"
                  max="5"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dueDate">Due Date:</label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={taskFormData.dueDate}
                  onChange={handleTaskChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="frequency">Frequency:</label>
                <input
                  type="number"
                  id="frequency"
                  name="frequency"
                  value={taskFormData.frequency}
                  onChange={handleTaskChange}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="frequencyType">Type:</label>
                <select
                  id="frequencyType"
                  name="frequencyType"
                  value={taskFormData.frequencyType}
                  onChange={handleTaskChange}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
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
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p>
              You need to create a goal first. Please provide the goal details:
            </p>
            <form onSubmit={handleCreateGoalAndTask}>
              <div className="form-group">
                <label htmlFor="goalCategory">Goal Category:</label>
                <select
                  id="goalCategory"
                  name="category"
                  value={goalFormData.category}
                  onChange={handleGoalChange}
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
                <label htmlFor="goalDescription">Goal Description:</label>
                <textarea
                  id="goalDescription"
                  name="description"
                  value={goalFormData.description}
                  onChange={handleGoalChange}
                  placeholder="Describe your goal..."
                  rows="2"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="goalColor">Goal Color:</label>
                <input
                  type="color"
                  id="goalColor"
                  name="colorHex"
                  value={goalFormData.colorHex}
                  onChange={handleGoalChange}
                />
              </div>

              <hr />

              <h4>Task Details</h4>

              <div className="form-group">
                <label htmlFor="taskTitle">Task Title:</label>
                <input
                  type="text"
                  id="taskTitle"
                  name="title"
                  value={taskFormData.title}
                  onChange={handleTaskChange}
                  placeholder="What needs to be done?"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="taskDescription">Task Description:</label>
                <textarea
                  id="taskDescription"
                  name="description"
                  value={taskFormData.description}
                  onChange={handleTaskChange}
                  placeholder="Describe the task..."
                  rows="3"
                  required
                />
              </div>

              {error && <div className="error">{error}</div>}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowGoalForm(false)}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Goal & Task'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskForm;
