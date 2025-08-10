import React, { useState, useEffect } from 'react';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NotificationBell = () => {
  const { unreadCount, notifications, markAsRead, markAllAsRead, requestNotificationPermission } = useNotificationContext();
  const [isOpen, setIsOpen] = useState(false);
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);

  // Solicitar permissão para notificações na primeira vez
  useEffect(() => {
    if (!hasRequestedPermission && 'Notification' in window) {
      requestNotificationPermission();
      setHasRequestedPermission(true);
    }
  }, [hasRequestedPermission, requestNotificationPermission]);

  // Obter ícone baseado no tipo de notificação
  const getNotificationIcon = (tipo) => {
    const icons = {
      'agendamento_criado': '📅',
      'agendamento_atualizado': '📅',
      'agendamento_cancelado': '❌',
      'login_sucesso': '✅',
      'senha_incorreta': '⚠️',
      'email_incorreto': '⚠️',
      'conta_bloqueada': '🔒',
      'usuario_criado': '👥',
      'processo_criado': '📋',
      'processo_atualizado': '📋',
      'arquivo_upload': '📎',
      'lembrete': '⏰',
      'alerta': '🚨'
    };
    return icons[tipo] || '🔔';
  };

  // Obter cor baseada no tipo
  const getNotificationColor = (tipo) => {
    if (tipo.includes('cancelado') || tipo.includes('incorreta') || tipo.includes('bloqueada')) {
      return 'text-red-600 bg-red-50';
    }
    if (tipo.includes('criado') || tipo.includes('sucesso')) {
      return 'text-green-600 bg-green-50';
    }
    if (tipo.includes('atualizado')) {
      return 'text-blue-600 bg-blue-50';
    }
    if (tipo.includes('alerta')) {
      return 'text-yellow-600 bg-yellow-50';
    }
    return 'text-gray-600 bg-gray-50';
  };

  // Formatar data relativa
  const formatRelativeTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'agora há pouco';
    }
  };

  // Notificações recentes (máximo 10)
  const recentNotifications = notifications.slice(0, 10);
  const unreadNotifications = recentNotifications.filter(n => !n.lida);

  return (
    <div className="relative">
      {/* Botão do sino */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors duration-200"
        title="Notificações"
      >
        <svg 
          className="w-6 h-6" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
        
        {/* Badge de contador */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-[20px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificações */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Cabeçalho */}
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              🔔 Notificações
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  markAllAsRead();
                  setIsOpen(false);
                }}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: '1px solid #007bff',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontWeight: 500,
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Lista de notificações */}
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <div className="text-4xl mb-2">📭</div>
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.lida ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => {
                      if (!notification.lida) {
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Ícone da notificação */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg ${getNotificationColor(notification.tipo)}`}>
                        {getNotificationIcon(notification.tipo)}
                      </div>
                      
                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${!notification.lida ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.titulo}
                          </p>
                          {!notification.lida && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${!notification.lida ? 'text-gray-700' : 'text-gray-500'}`}>
                          {notification.mensagem}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatRelativeTime(notification.data_criacao)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rodapé */}
          {recentNotifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: '1px solid #007bff',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontWeight: 500,
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
              >
                Ver todas as notificações
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay para fechar */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
