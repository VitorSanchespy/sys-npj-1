// src/utils/auth.js
export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const clearToken = () => localStorage.removeItem('token');

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
export const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
export const clearUser = () => localStorage.removeItem('user');

export const isAuthenticated = () => !!getToken();
export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const loginPath = '/login';
export const logout = clearSession; // Alterado: apenas limpa a sessão
export const getCurrentToken = getToken;
export const getCurrentUser = getUser;