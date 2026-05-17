import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getGoals, getGoal, updateTaskStatus, deleteTask, updateGoal, deleteGoal } from '../api/api';
import TaskForm from './TaskForm';
import GoalForm from './GoalForm';
import './GoalsList.css';

const GoalsList = ({ userId, refreshToken, onGoalCreated }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [openGoalEditMenu, setOpenGoalEditMenu] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      // Check if click is outside any goal edit menu container
      const isInEditMenu = event.target.closest('.goal-edit-menu-container');
      if (!isInEditMenu) {
        setOpenGoalEditMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);
      const goalsData = await getGoals(userId);
      // Load tasks for each goal
      const goalsWithTasks = await Promise.all(
        goalsData.map(async (goal) => {
          try {
            const goalWithTasks = await getGoal(userId, goal.id);
            return goalWithTasks;
          } catch (err) {
            console.error(`Failed to load tasks for goal ${goal.id}:`, err);
            return goal; // Return goal without tasks if loading fails
          }
        }),
      );
      setGoals(goalsWithTasks);
      setError(null);
    } catch (err) {
      setError('Failed to load goals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      await loadGoals(); // Reload to get updated data
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        await loadGoals(); // Reload to get updated data
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const handleGoalStatusUpdate = async (goalId, newStatus) => {
    try {
      await updateGoal(userId, goalId, { status: newStatus });
      await loadGoals(); // Reload to get updated data
    } catch (err) {
      console.error('Failed to update goal status:', err);
      setError('Failed to update goal status');
    }
  };

  const handleGoalDelete = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      try {
        await deleteGoal(userId, goalId);
        await loadGoals(); // Reload to get updated data
      } catch (err) {
        console.error('Failed to delete goal:', err);
        setError('Failed to delete goal');
      }
    }
  };

  const handleTaskCreated = () => {
    setShowTaskForm(null);
    loadGoals(); // Reload to show new task
  };

  const handleGoalCreated = () => {
    setShowGoalForm(false);
    loadGoals(); // Reload to show new goal
    if (onGoalCreated) onGoalCreated();
  };

  const handleCreateGoal = () => {
    setShowGoalForm(true);
    setShowDropdown(false);
  };

  const handleCreateTask = () => {
    setShowTaskForm('new'); // Special value to show task form without pre-selected goal
    setShowDropdown(false);
  };

  const formatStatus = (status) => {
    if (!status) return 'Pending';

    const map = {
      Pending: 'Pending',
      InProgress: 'In Progress',
      Completed: 'Completed',
      Abandoned: 'Abandoned',
      OnHold: 'On Hold',
    };

    return map[status] ?? status;
  };

  const filteredGoals = selectedStatusFilter === 'All'
    ? goals
    : goals.filter(goal => formatStatus(goal.status) === selectedStatusFilter);

  const statusOptions = ['All', 'Pending', 'In Progress', 'Completed', 'Abandoned', 'On Hold'];

  if (loading) {
    return <div className="loading">Loading goals...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="goals-list">
      <div className="goals-header">
        <h2>Your Goals</h2>
        <div className="create-dropdown" ref={dropdownRef}>
          <button
            className="btn btn-primary create-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            +
          </button>
          {showDropdown && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={handleCreateGoal}>
                Create Goal
              </button>
              <button className="dropdown-item" onClick={handleCreateTask}>
                Create Task
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="status-filters">
        {statusOptions.map((status) => (
          <button
            key={status}
            className={`status-filter-btn ${selectedStatusFilter === status ? 'active' : ''}`}
            onClick={() => setSelectedStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {showGoalForm && (
        <GoalForm
          userId={userId}
          onGoalCreated={handleGoalCreated}
          onCancel={() => setShowGoalForm(false)}
        />
      )}

      {showTaskForm && (
        <TaskForm
          goalId={showTaskForm === 'new' ? null : showTaskForm}
          userId={userId}
          onTaskCreated={handleTaskCreated}
          onCancel={() => setShowTaskForm(null)}
        />
      )}

      {goals.length === 0 ? (
        <p>No goals yet. Create your first goal to get started!</p>
      ) : filteredGoals.length === 0 ? (
        <p>No goals with the selected status.</p>
      ) : (
        filteredGoals.map((goal) => (
          <div
            key={goal.id}
            className="goal-card"
            style={{ borderLeftColor: goal.colorHex || '#007bff' }}
          >
            <div className="goal-header">
              <div className="goal-title-section">
                <h3>{goal.category}</h3>
                <span className="goal-status">
                  Status: {formatStatus(goal.status)}
                </span>
              </div>
              <div className="goal-edit-menu-container">
                <button
                  className="edit-btn"
                  onClick={() => setOpenGoalEditMenu(openGoalEditMenu === goal.id ? null : goal.id)}
                  title="Edit goal"
                >
                  ✏️
                </button>
                {openGoalEditMenu === goal.id && (
                  <div className="goal-edit-menu">
                    <div className="edit-menu-item">
                      <label>Change Status:</label>
                      <select
                        className="goal-status-select"
                        value={goal.status}
                        onChange={(e) => {
                          handleGoalStatusUpdate(goal.id, e.target.value);
                          setOpenGoalEditMenu(null);
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="InProgress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Abandoned">Abandoned</option>
                        <option value="OnHold">On Hold</option>
                      </select>
                    </div>
                    <button
                      className="btn btn-danger btn-sm delete-goal-btn"
                      onClick={() => {
                        setOpenGoalEditMenu(null);
                        handleGoalDelete(goal.id);
                      }}
                    >
                      Delete Goal
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="goal-description">{goal.description}</p>
            <div className="goal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowTaskForm(goal.id)}
              >
                Add Task
              </button>
            </div>

            {showTaskForm === goal.id && (
              <TaskForm
                goalId={goal.id}
                userId={userId}
                onTaskCreated={handleTaskCreated}
                onCancel={() => setShowTaskForm(null)}
              />
            )}

            <div className="tasks-section">
              <h4>Tasks</h4>
              {goal.tasks && goal.tasks.length > 0 ? (
                <ul className="tasks-list">
                  {goal.tasks.map((task) => (
                    <li
                      key={task.id}
                      className={`task-item ${task.status.toLowerCase()}`}
                    >
                      <div className="task-content">
                        <h5>{task.title}</h5>
                        <p>{task.description}</p>
                        <div className="task-meta">
                          <span>Points: {task.points}</span>
                          <span>Priority: {task.priority}</span>
                          {task.dueDate && (
                            <span>
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="task-actions">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleTaskStatusUpdate(task.id, e.target.value)
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="InProgress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Abandoned">Abandoned</option>
                          <option value="OnHold">On Hold</option>
                        </select>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleTaskDelete(task.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No tasks yet. Add a task to work towards this goal!</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default GoalsList;
