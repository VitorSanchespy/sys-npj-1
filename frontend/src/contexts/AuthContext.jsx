import { createContext, useState, useContext, useEffect } from 'react';
import api from '@/api/apiService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // Configura interceptors para incluir token automaticamente
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(config => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/perfil');
        setUser(response.data);
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };
    
    verifyToken();
  }, []);

  const login = async (credentials) => {
    try {
      // CORREÇÃO: Use diretamente api.post sem configurar manualmente
      const response = await api.post('/auth/login', credentials);
      
      const { token, usuario } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(usuario));
      
      // Adiciona token ao header para futuras requisições
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(usuario);
      return { success: true };
    } catch (error) {
      // CORREÇÃO: Tratamento adequado de erros do Axios
      return { 
        success: false, 
        message: error.response?.data?.erro || 'Erro no login' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/registrar', {
        nome: userData.nome,
        email: userData.email,
        senha: userData.senha,
        role_id: userData.role_id || 2
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.erro || 'Erro no cadastro' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);