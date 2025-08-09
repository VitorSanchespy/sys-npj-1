import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const GoogleCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processando autorização...');

  // Função para configurar headers de autenticação
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  };

  // Função para processar callback
  const handleCallback = async (code) => {
    try {
      await axios.post(
        'http://localhost:3001/api/google-calendar/callback',
        { code },
        getAuthHeaders()
      );
      
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.erro || 'Erro no callback');
    }
  };

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage('Autorização cancelada ou erro: ' + error);
        setTimeout(() => navigate('/agendamentos'), 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('Código de autorização não encontrado');
        setTimeout(() => navigate('/agendamentos'), 3000);
        return;
      }

      try {
        await handleCallback(code);
        setStatus('success');
        setMessage('Google Calendar conectado com sucesso!');
        setTimeout(() => navigate('/agendamentos'), 2000);
      } catch (error) {
        setStatus('error');
        setMessage('Erro ao conectar: ' + (error.message || 'Erro desconhecido'));
        setTimeout(() => navigate('/agendamentos'), 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Conectando...</h2>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-green-900 mb-2">Sucesso!</h2>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-red-900 mb-2">Erro</h2>
            </>
          )}
          
          <p className="text-gray-600">{message}</p>
          
          {status !== 'processing' && (
            <button
              onClick={() => navigate('/agendamentos')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Voltar aos Agendamentos
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
