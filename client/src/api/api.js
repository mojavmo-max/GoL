import {
  AUTH_LOGIN_URL,
  AUTH_REGISTER_URL,
  USER_PROFILE_URL,
  GOALS_URL,
  TASKS_URL,
} from './config';

const jsonHeaders = { 'Content-Type': 'application/json' };

export const register = async (email, password) => {
  const response = await fetch(AUTH_REGISTER_URL, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

export const login = async (email, password) => {
  const response = await fetch(AUTH_LOGIN_URL, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

export const getProfile = async (userId) => {
  const response = await fetch(`${USER_PROFILE_URL}/${userId}`);
  return response.json();
};

export const updateProfile = async (userId, payload) => {
  const response = await fetch(`${USER_PROFILE_URL}/${userId}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
  return response.json();
};

// Goals API functions
export const getGoals = async (userId) => {
  const response = await fetch(`${GOALS_URL}/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch goals');
  }
  return response.json();
};

export const createGoal = async (userId, goalData) => {
  debugger;
  const response = await fetch(`${GOALS_URL}/${userId}`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(goalData),
  });
  if (!response.ok) {
    throw new Error('Failed to create goal');
  }
  return response.json();
};

export const getGoal = async (userId, goalId) => {
  const response = await fetch(`${GOALS_URL}/${userId}/${goalId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch goal');
  }
  return response.json();
};

export const updateGoal = async (userId, goalId, goalData) => {
  const response = await fetch(`${GOALS_URL}/${userId}/${goalId}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify(goalData),
  });
  if (!response.ok) {
    throw new Error('Failed to update goal');
  }
  return response.json();
};

export const deleteGoal = async (userId, goalId) => {
  const response = await fetch(`${GOALS_URL}/${userId}/${goalId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete goal');
  }
  return response.json();
};

// Tasks API functions
export const createTask = async (taskData) => {
  const response = await fetch(`${TASKS_URL}/create`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(taskData),
  });
  if (!response.ok) {
    throw new Error('Failed to create task');
  }
  return response.json();
};

export const updateTaskStatus = async (taskId, status) => {
  const response = await fetch(`${TASKS_URL}/${taskId}/status`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error('Failed to update task status');
  }
  return response.json();
};

export const getTask = async (taskId) => {
  const response = await fetch(`${TASKS_URL}/${taskId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch task');
  }
  return response.json();
};

export const deleteTask = async (taskId) => {
  const response = await fetch(`${TASKS_URL}/${taskId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete task');
  }
  return response.json();
};
