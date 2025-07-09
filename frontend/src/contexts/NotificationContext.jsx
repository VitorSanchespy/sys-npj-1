// src/contexts/NotificationContext.jsx
import { createContext, useContext } from 'react';
import { notifications } from '@mantine/notifications';
import { 
  IconCheck, 
  IconX, 
  IconInfoCircle, 
  IconAlertCircle 
} from '@tabler/icons-react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const showNotification = (options) => {
    const { 
      type = 'info', 
      title, 
      message, 
      autoClose = 5000,
      ...rest
    } = options;
    
    const typeSettings = {
      success: {
        color: 'teal',
        icon: <IconCheck size={18} />,
        title: title || 'Sucesso!'
      },
      error: {
        color: 'red',
        icon: <IconX size={18} />,
        title: title || 'Erro!'
      },
      warning: {
        color: 'orange',
        icon: <IconAlertCircle size={18} />,
        title: title || 'Atenção!'
      },
      info: {
        color: 'blue',
        icon: <IconInfoCircle size={18} />,
        title: title || 'Informação'
      }
    };
    
    const settings = typeSettings[type] || typeSettings.info;
    
    notifications.show({
      message,
      autoClose,
      ...settings,
      ...rest
    });
  };

  // Métodos específicos para tipos de notificação
  const api = {
    show: showNotification,
    success: (message, options) => 
      showNotification({ ...options, type: 'success', message }),
    error: (message, options) => 
      showNotification({ ...options, type: 'error', message }),
    warning: (message, options) => 
      showNotification({ ...options, type: 'warning', message }),
    info: (message, options) => 
      showNotification({ ...options, type: 'info', message }),
    clean: () => notifications.clean(),
    cleanQueue: () => notifications.cleanQueue(),
    update: (id, options) => notifications.update(id, options),
    hide: (id) => notifications.hide(id)
  };

  return (
    <NotificationContext.Provider value={api}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
  }
  return context;
}