import React from 'react';
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';

const GoogleCalendarConnect = () => {
  const { loading, connected, error, connectGoogle, disconnect } = useGoogleCalendar();

  const handleConnect = async () => {
    try {
      await connectGoogle();
      // O redirect acontecerá automaticamente
    } catch (error) {
      console.error('Erro ao conectar:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            📅
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Google Calendar
            </h3>
            <p className="text-sm text-gray-600">
              {connected 
                ? 'Conectado - seus agendamentos serão sincronizados'
                : 'Conecte para sincronizar seus agendamentos automaticamente'
              }
            </p>
            {loading && (
              <p className="text-xs text-blue-600 mt-1">
                Redirecionando para autorização...
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          
          {connected ? (
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Desconectando...' : 'Desconectar'}
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Conectando...' : 'Conectar Google Calendar'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm">
          <strong>Erro:</strong> {error}
        </div>
      )}

      {connected && (
        <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-400 text-green-700 text-sm">
          <strong>✅ Conectado!</strong> Seus novos agendamentos serão automaticamente adicionados ao Google Calendar.
        </div>
      )}
    </div>
  );
};

export default GoogleCalendarConnect;
