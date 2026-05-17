import React, { useEffect, useState } from 'react';
import { getTaskDetails } from '../api/api';
import './TaskDetailsModal.css';

const CATEGORY_NAMES = {
  0: 'Not Specified',
  1: 'Wealth',
  2: 'Fitness',
  3: 'Social',
  4: 'Spirit',
  5: 'Health',
  6: 'Education',
  7: 'Career',
  8: 'Creativity',
  9: 'Family',
  10: 'Adventure',
  11: 'Leadership',
  12: 'Happiness',
};

const STATUS_NAMES = {
  0: 'Pending',
  1: 'In Progress',
  2: 'Completed',
  3: 'Abandoned',
  4: 'On Hold',
};

const TaskDetailsModal = ({ userId, categoryId, categoryName, level, totalScore, onClose }) => {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTaskDetails(userId, categoryId);
        setDetails(data || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch task details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [userId, categoryId]);

  // Group tasks by goal
  const goalMap = {};
  details.forEach((item) => {
    if (!goalMap[item.goalId]) {
      goalMap[item.goalId] = {
        goalId: item.goalId,
        goalDescription: item.goalDescription,
        colorHex: item.colorHex,
        goalStatus: item.goalStatus,
        tasks: [],
      };
    }
    if (item.taskId) {
      goalMap[item.goalId].tasks.push({
        taskId: item.taskId,
        taskName: item.taskName,
        taskStatus: item.taskStatus,
        taskPoints: item.taskPoints,
        taskCompletedAt: item.taskCompletedAt,
      });
    }
  });

  const goals = Object.values(goalMap);

  // Calculate total points from completed tasks
  const totalPoints = details.reduce((sum, item) => {
    if (item.taskStatus === 2 && item.taskPoints) {
      return sum + item.taskPoints;
    }
    return sum;
  }, 0);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="task-details-modal-overlay" onClick={onClose}>
      <div className="task-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Task Details</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Level 1: Category Header */}
        <div className="task-details-header">
          <div className="category-header-info">
            <h3>{categoryName}</h3>
            <span className="level-badge">Level {level}</span>
          </div>
          <div className="category-total-points">
            Total Points: <strong>{totalPoints}</strong>
          </div>
        </div>

        <div className="modal-content">
          {loading ? (
            <p className="loading">Loading task details...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : goals.length === 0 ? (
            <p className="no-data">No goals found for this category.</p>
          ) : (
            <div className="goals-container">
              {goals.map((goal) => {
                const goalCompletedPoints = goal.tasks.reduce((sum, task) => {
                  if (task.taskStatus === 2) {
                    return sum + (task.taskPoints || 0);
                  }
                  return sum;
                }, 0);

                const completedTasks = goal.tasks.filter((t) => t.taskStatus === 2);

                return (
                  <div
                    key={goal.goalId}
                    className="goal-box"
                    style={{ borderLeftColor: goal.colorHex || '#007bff' }}
                  >
                    {/* Level 2: Goal with total points */}
                    <div className="goal-header-info">
                      <h4>{goal.goalDescription}</h4>
                      <span className="goal-points">
                        Points: <strong>{goalCompletedPoints}</strong>
                      </span>
                    </div>

                    {/* Level 3: Completed tasks */}
                    <div className="tasks-container">
                      {completedTasks.length === 0 ? (
                        <p className="no-tasks">No completed tasks</p>
                      ) : (
                        <ul className="completed-tasks-list">
                          {completedTasks.map((task) => (
                            <li key={task.taskId} className="completed-task-item">
                              <div className="task-row">
                                <span className="task-name">{task.taskName}</span>
                                <span className="task-points">{task.taskPoints} pts</span>
                                <span className="task-date">
                                  {formatDate(task.taskCompletedAt)}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
