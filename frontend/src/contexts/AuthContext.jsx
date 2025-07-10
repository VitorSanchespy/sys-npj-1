// src/contexts/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { verifyToken } from '@/services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };


  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = await verifyToken();
        setUser(userData);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    setUser,
    logout // Adicionar esta função
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};