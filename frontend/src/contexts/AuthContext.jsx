import { createContext, useState, useEffect, useContext } from 'react';
import auth from '@/services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificar = async () => {
      try {
          const user = await auth.verifyToken();
          setUser(user);
        } catch (error) {
         console.error('Error verifying token:', error);
         setUser(null);
          }finally {
            setLoading(false);
        }
      };
      verificar();
    },[]);

  const login = async (credentials) => {
    const userData = await auth.login(credentials);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated: !!user, 
      login, 
      logout, 
      setUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);