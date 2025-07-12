// src/utils/auth.js
export const getToken = () => localStorage.getItem('token');
export const setToken = token => localStorage.setItem('token', token);
export const clearToken = () => localStorage.removeItem('token');

export const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');
export const setUser = user => localStorage.setItem('user', JSON.stringify(user));
export const clearUser = () => localStorage.removeItem('user');

export const isAuthenticated = () => !!getToken();
export const clearSession = () => {
  clearToken();
  clearUser();
};

export const loginPath = '/login';
export const logout = clearSession;
export const getCurrentUser = getUser;