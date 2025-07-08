import { createContext, useState, useCallback } from 'react';
import Notification from '@/components/Notification';

export const NotificationContext = createContext({
  showNotification: () => {},
});

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    
    // Limpa notificação automática após 5 segundos
    const timer = setTimeout(() => {
      setNotification(null);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, clearNotification }}>
      {children}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}
    </NotificationContext.Provider>
  );
}