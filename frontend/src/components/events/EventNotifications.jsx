import React, { useState, useEffect } from 'react';
import { eventService } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BellIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const EventNotificationPopup = ({ notification, onClose, onAction }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'request_approval':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'reminder':
        return <BellIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case 'request_approval':
        return 'Nova Solicitação de Evento';
      case 'approved':
        return 'Evento Aprovado';
      case 'rejected':
        return 'Evento Rejeitado';
      case 'reminder':
        return 'Lembrete de Evento';
      default:
        return 'Notificação de Evento';
    }
  };

  const canApprove = notification.type === 'request_approval';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            {getNotificationIcon(notification.type)}
            <h3 className="ml-2 text-lg font-semibold text-gray-900">
              {getNotificationTitle(notification.type)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">
            {notification.event?.title}
          </h4>
          
          {notification.event?.description && (
            <p className="text-gray-600 text-sm mb-3">
              {notification.event.description}
            </p>
          )}

          <div className="flex items-center text-sm text-gray-500 mb-2">
            <CalendarIcon className="w-4 h-4 mr-1" />
            <span>
              {formatDate(notification.event?.start_at)} - {formatDate(notification.event?.end_at)}
            </span>
          </div>

          {notification.event?.participants && notification.event.participants.length > 0 && (
            <div className="text-sm text-gray-500">
              <span className="font-medium">Participantes:</span>
              <div className="mt-1">
                {notification.event.participants.map((email, index) => (
                  <span key={index} className="inline-block bg-gray-100 rounded px-2 py-1 text-xs mr-1 mb-1">
                    {email}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
          
          {canApprove && (
            <>
              <button
                onClick={() => onAction('reject')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Rejeitar
              </button>
              <button
                onClick={() => onAction('approve')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Aprovar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const EventNotifications = () => {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkForNotifications = async () => {
    try {
      // Simular busca de notificações de eventos
      // Aqui você faria uma chamada real para buscar notificações
      const pendingEvents = await eventService.getEvents({ status: 'requested' }, token);
      
      if (pendingEvents.success && pendingEvents.data.length > 0) {
        const newNotifications = pendingEvents.data.map(event => ({
          id: `event_${event.id}`,
          type: 'request_approval',
          event: event,
          created_at: new Date().toISOString()
        }));

        setNotifications(newNotifications);
        
        // Mostrar primeira notificação se houver
        if (newNotifications.length > 0 && !showPopup) {
          setCurrentNotification(newNotifications[0]);
          setShowPopup(true);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  const handleNotificationAction = async (action) => {
    if (!currentNotification || !currentNotification.event) return;

    setLoading(true);
    try {
      const eventId = currentNotification.event.id;
      
      if (action === 'approve') {
        await eventService.approveEvent(eventId, token);
      } else if (action === 'reject') {
        await eventService.rejectEvent(eventId, { reason: 'Rejeitado pelo usuário' }, token);
      }

      // Remover notificação da lista
      setNotifications(prev => prev.filter(n => n.id !== currentNotification.id));
      setShowPopup(false);
      setCurrentNotification(null);

      // Mostrar próxima notificação se existir
      const remainingNotifications = notifications.filter(n => n.id !== currentNotification.id);
      if (remainingNotifications.length > 0) {
        setTimeout(() => {
          setCurrentNotification(remainingNotifications[0]);
          setShowPopup(true);
        }, 1000);
      }

    } catch (error) {
      console.error(`Erro ao ${action} evento:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setCurrentNotification(null);
    
    // Mostrar próxima notificação após 5 segundos
    const remainingNotifications = notifications.filter(n => n.id !== currentNotification?.id);
    if (remainingNotifications.length > 0) {
      setTimeout(() => {
        setCurrentNotification(remainingNotifications[0]);
        setShowPopup(true);
      }, 5000);
    }
  };

  useEffect(() => {
    if (token && user) {
      // Verificar notificações ao carregar
      checkForNotifications();
      
      // Verificar notificações periodicamente (a cada 30 segundos)
      const interval = setInterval(checkForNotifications, 30000);
      
      return () => clearInterval(interval);
    }
  }, [token, user]);

  // Indicador de notificações pendentes
  const NotificationBadge = () => {
    if (notifications.length === 0) return null;

    return (
      <div className="fixed top-4 right-4 z-40">
        <div className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
          {notifications.length}
        </div>
      </div>
    );
  };

  return (
    <>
      <NotificationBadge />
      
      {showPopup && currentNotification && (
        <EventNotificationPopup
          notification={currentNotification}
          onClose={handleClosePopup}
          onAction={handleNotificationAction}
        />
      )}
    </>
  );
};

export default EventNotifications;
