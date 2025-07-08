import { createContext, useContext } from 'react';
import { notifications } from '@mantine/notifications';

// 1. Primeiro declare o contexto
const NotificationContext = createContext();

// 2. Depois crie o Provider
export function NotificationProvider({ children }) {
  const showNotification = (message, type = 'info') => {
    notifications.show({
      title: type === 'error' ? 'Erro' : 'Sucesso',
      message,
      color: type === 'error' ? 'red' : 'green',
    });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

// 3. Por último exporte o hook customizado
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}