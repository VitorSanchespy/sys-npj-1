import { useEffect, useState, useCallback } from 'react';
import { getUser, setUser, clearUser, getToken, setToken, clearToken, isAuthenticated } from '@/utils/auth';

export function useAuth() {
  const [usuario, setUsuario] = useState(getUser());
  const [loading, setLoading] = useState(false);

  const login = useCallback((user, token) => {
    setUser(user);
    setToken(token);
    setUsuario(user);
  }, []);

  const logout = useCallback(() => {
    clearUser();
    clearToken();
    setUsuario(null);
  }, []);

  useEffect(() => {
    setUsuario(getUser());
  }, []);

  return { usuario, setUsuario, login, logout, loading, isAuthenticated: !!usuario };
}

export default useAuth;