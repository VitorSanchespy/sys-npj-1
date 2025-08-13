import { useState, useEffect, useContext, createContext } from 'react';
import { apiRequest } from '@/api/apiRequest';
import { useAuthContext } from '@/contexts/AuthContext';

// Contexto para gerenciar estado do Google Calendar
const GoogleCalendarContext = createContext();

export const GoogleCalendarProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuthContext();

  // Verificar status da conexão
  const checkConnection = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await apiRequest('/api/google-calendar/status', {
        method: 'GET',
        token
      });

      if (response.success || response.connected !== undefined) {
        setIsConnected(!!response.connected);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Erro ao verificar conexão Google Calendar:', error);
      setIsConnected(false);
      setError('Erro ao verificar conexão');
    } finally {
      setLoading(false);
    }
  };

  // Iniciar processo de conexão
  const connectCalendar = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Iniciando conexão Google Calendar...');
      
      // Obter URL de autorização
      const response = await apiRequest('/api/google-calendar/auth-url', {
        method: 'GET',
        token
      });

      console.log('📡 Resposta da API:', response);

      if (response.authUrl) {
        console.log('🔗 Redirecionando para:', response.authUrl);
        // Usar redirect completo em vez de popup
        window.location.href = response.authUrl;
      } else {
        throw new Error('URL de autorização não recebida');
      }
    } catch (error) {
      console.error('❌ Erro ao conectar Google Calendar:', error);
      setError(error.message || 'Erro ao conectar com Google Calendar');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Desconectar Google Calendar
  const disconnectCalendar = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('/api/google-calendar/disconnect', {
        method: 'POST',
        token
      });

      if (response.sucesso) {
        setIsConnected(false);
        return { success: true, message: 'Google Calendar desconectado com sucesso!' };
      } else {
        throw new Error('Erro ao desconectar');
      }
    } catch (error) {
      console.error('Erro ao desconectar Google Calendar:', error);
      setError('Erro ao desconectar Google Calendar');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Recarregar conexão
  const refreshConnection = async () => {
    await checkConnection();
  };

  useEffect(() => {
    checkConnection();
  }, [token]);

  const value = {
    isConnected,
    loading,
    error,
    connectCalendar,
    disconnectCalendar,
    checkConnection,
    refreshConnection
  };

  return (
    <GoogleCalendarContext.Provider value={value}>
      {children}
    </GoogleCalendarContext.Provider>
  );
};

export const useGoogleCalendar = () => {
  const context = useContext(GoogleCalendarContext);
  if (!context) {
    throw new Error('useGoogleCalendar deve ser usado dentro de GoogleCalendarProvider');
  }
  return context;
};
