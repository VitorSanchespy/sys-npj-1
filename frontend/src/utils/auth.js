// src/utils/auth.js

// Token Management
export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const clearToken = () => localStorage.removeItem('token');

// User Management
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
export const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
export const clearUser = () => localStorage.removeItem('user');

// Session Management
export const isAuthenticated = () => !!getToken();
export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Auth Constants
export const loginPath = '/login';

// Updated logout function without redirection
export const logout = clearSession;

// Aliases for compatibility
export const getCurrentToken = getToken;
export const getCurrentUser = getUser;

// New function for navigation
export const redirectToLogin = () => {
  window.location.href = loginPath;
};