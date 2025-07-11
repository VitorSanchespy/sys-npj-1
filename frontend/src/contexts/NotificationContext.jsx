import { createContext, useContext } from 'react';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconInfoCircle, IconAlertCircle } from '@tabler/icons-react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const show = (type, message, options = {}) => {
    const icons = {
      success: <IconCheck size={18} />,
      error: <IconX size={18} />,
      warning: <IconAlertCircle size={18} />,
      info: <IconInfoCircle size={18} />
    };
    
    const colors = {
      success: 'teal',
      error: 'red',
      warning: 'orange',
      info: 'blue'
    };
    
    notifications.show({
      message,
      icon: icons[type] || icons.info,
      color: colors[type] || colors.info,
      title: options.title || type.charAt(0).toUpperCase() + type.slice(1),
      autoClose: options.autoClose || 5000,
      ...options
    });
  };

  const api = {
    show: (options) => show(options.type || 'info', options.message, options),
    success: (message, options) => show('success', message, options),
    error: (message, options) => show('error', message, options),
    warning: (message, options) => show('warning', message, options),
    info: (message, options) => show('info', message, options),
    clean: notifications.clean,
    cleanQueue: notifications.cleanQueue,
    update: notifications.update,
    hide: notifications.hide
  };

  return (
    <NotificationContext.Provider value={api}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
  return context;
}