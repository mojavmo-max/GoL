export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5118';

export const AUTH_REGISTER_URL = `${API_BASE_URL}/auth/register`;
export const AUTH_LOGIN_URL = `${API_BASE_URL}/auth/login`;
export const USER_PROFILE_URL = `${API_BASE_URL}/profile`;
export const GOALS_URL = `${API_BASE_URL}/goals`;
export const TASKS_URL = `${API_BASE_URL}/goals/task`;
export const BUDGET_URL = `${API_BASE_URL}/budget`;
export const ENERGY_URL = `${API_BASE_URL}/energy`;
