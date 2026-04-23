import React, { useState, useEffect, useRef } from 'react';
import { getGoals, getGoal, updateTaskStatus, deleteTask } from '../api/api';
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
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    loadGoals();
  }, [userId, refreshToken, loadGoals]);

  const loadGoals = async () => {
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
  };

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
      ) : (
        goals.map((goal) => (
          <div
            key={goal.id}
            className="goal-card"
            style={{ borderLeftColor: goal.colorHex || '#007bff' }}
          >
            <div className="goal-header">
              <h3>{goal.category}</h3>
              <span className="progress-score">
                Progress: {goal.progressScore}%
              </span>
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
                          <option value="NotStarted">Not Started</option>
                          <option value="InProgress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
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
