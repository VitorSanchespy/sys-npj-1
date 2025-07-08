// src/utils/auth.js
export const AuthUtils = {
  // Gerenciamento de Token
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => localStorage.setItem('token', token),
  clearToken: () => localStorage.removeItem('token'),

  // Gerenciamento de Usuário
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
  clearUser: () => localStorage.removeItem('user'),

  // Controle de Sessão
  isAuthenticated: () => !!localStorage.getItem('token'),
  clearSession: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Redirecionamento
  loginPath: '/login',
  redirectToLogin: () => window.location.href = '/login'
};

// Métodos simplificados para uso comum
export const getCurrentToken = () => AuthUtils.getToken();
export const getCurrentUser = () => AuthUtils.getUser();
export const isUserAuthenticated = () => AuthUtils.isAuthenticated();
export const logout = () => {
  AuthUtils.clearSession();
  AuthUtils.redirectToLogin();
};