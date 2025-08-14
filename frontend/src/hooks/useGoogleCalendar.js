import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export const useGoogleCalendar = () => {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  // Configurar axios com token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  };

  // Verificar status da conexão
  const checkConnectionStatus = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/google-calendar/status`,
        getAuthHeaders()
      );
      setConnected(response.data.connected);
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      // Se erro for 401 (não autenticado), não é um erro crítico
      if (error.response?.status === 401) {
        setConnected(false);
      } else {
        setConnected(false);
      }
    }
  };

  // Conectar com Google Calendar
  const connectGoogle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Token encontrado:', token ? 'SIM' : 'NÃO');
      console.log('🔍 Headers enviados:', getAuthHeaders());
      
      // Obter URL de autorização
      console.log('🚀 Fazendo request para:', `${API_BASE}/google-calendar/auth-url`);
      const response = await axios.get(
        `${API_BASE}/google-calendar/auth-url`,
        getAuthHeaders()
      );
      
      console.log('✅ Resposta recebida:', response.data);

      const authUrl = response.data.authUrl;
      
      console.log('🔗 URL de autorização recebida:', authUrl);
      
      // Usar redirect em vez de popup para evitar problemas de CORS
      window.location.href = authUrl;

    } catch (error) {
      console.error('❌ Erro detalhado:', error);
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Status:', error.response?.status);
      setError(error.response?.data?.erro || 'Erro ao conectar');
      setLoading(false);
      throw error;
    }
  };

  // Processar callback do Google (para quando usar redirect ao invés de popup)
  const handleCallback = async (code) => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.post(
        `${API_BASE}/google-calendar/callback`,
        { code },
        getAuthHeaders()
      );
      
      setConnected(true);
      return true;
    } catch (error) {
      setError(error.response?.data?.erro || 'Erro no callback');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Desconectar Google Calendar
  const disconnect = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.post(
        `${API_BASE}/google-calendar/disconnect`,
        {},
        getAuthHeaders()
      );
      
      setConnected(false);
    } catch (error) {
      setError(error.response?.data?.erro || 'Erro ao desconectar');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Listar eventos do Google Calendar
  const getEvents = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/google-calendar/events`,
        getAuthHeaders()
      );
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.erro || 'Erro ao buscar eventos');
      throw error;
    }
  };

  // Verificar status ao carregar o hook
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkConnectionStatus();
    }
  }, []);

  return {
    loading,
    isConnected: connected,
    connected,
    error,
    connectCalendar: connectGoogle,
    connectGoogle,
    disconnectCalendar: disconnect,
    disconnect,
    getEvents,
    handleCallback,
    checkConnectionStatus
  };
};
