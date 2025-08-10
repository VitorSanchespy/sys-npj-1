import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthContext } from './AuthContext';
import notificationService from '../services/notificationService';

const NotificationContext = createContext();

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext deve ser usado dentro de NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, token, loading: authLoading } = useAuthContext();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [newNotification, setNewNotification] = useState(null);

  // Conectar WebSocket quando usuário logar
  useEffect(() => {
    // Aguardar que a autenticação seja verificada antes de carregar notificações
    if (authLoading) return;
    
    if (user && token) {
      notificationService.connect(user.id, token);
      
      // Configurar handler para novas notificações via WebSocket
      notificationService.setNotificationHandler((notification) => {
        // Log de desenvolvimento para debug de notificações
        if (process.env.NODE_ENV === 'development') {
          console.log('🔔 Nova notificação via WebSocket:', notification);
        }
        
        // Adicionar nova notificação à lista
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        setNewNotification(notification);
        
        // Mostrar notificação visual
        showNotificationToast(notification);
      });

      // Carregar notificações existentes
      loadNotifications();
      loadUnreadCount();
    }

    return () => {
      notificationService.disconnect();
    };
  }, [user, token, authLoading]);

  // Carregar notificações do servidor
  const loadNotifications = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const data = await notificationService.getNotifications(token);
      // Suporte tanto para array direto quanto para objeto { notificacoes }
      if (Array.isArray(data)) {
        setNotifications(data);
      } else if (data && Array.isArray(data.notificacoes)) {
        setNotifications(data.notificacoes);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar contador de não lidas
  const loadUnreadCount = async () => {
    if (!token) return;
    
    try {
      const count = await notificationService.getUnreadCount(token);
      setUnreadCount(count);
    } catch (error) {
      console.error('❌ Erro ao carregar contador:', error);
    }
  };

  // Marcar notificação como lida
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(token, notificationId);
      
      // Atualizar estado local
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, lida: true, data_leitura: new Date() }
            : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('❌ Erro ao marcar como lida:', error);
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(token);
      
      // Atualizar estado local
      setNotifications(prev => 
        prev.map(n => ({ ...n, lida: true, data_leitura: new Date() }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('❌ Erro ao marcar todas como lidas:', error);
    }
  };

  // Mostrar toast de notificação
  const showNotificationToast = (notification) => {
    // Verificar se o navegador suporta notificações
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.titulo, {
        body: notification.mensagem,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
    
    // Também mostrar notificação visual na UI
    // (será implementado no componente de toast)
  };

  // Solicitar permissão para notificações do navegador
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  // Filtrar notificações por tipo
  const getNotificationsByType = (type) => {
    return notifications.filter(n => n.tipo === type);
  };

  // Obter notificações não lidas
  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.lida);
  };

  // Remover notificação temporária
  const clearNewNotification = () => {
    setNewNotification(null);
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    newNotification,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    requestNotificationPermission,
    getNotificationsByType,
    getUnreadNotifications,
    clearNewNotification,
    showNotificationToast
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
