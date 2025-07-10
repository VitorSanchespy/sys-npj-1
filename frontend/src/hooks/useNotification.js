// src/hooks/useNotification.js
import { notifications } from '@mantine/notifications';

export default function useNotification() {
  const showNotification = (options) => {
    notifications.show(options);
  };

  const showSuccess = (message) => {
    notifications.show({
      title: 'Sucesso',
      message,
      color: 'green',
    });
  };

  const showError = (message) => {
    notifications.show({
      title: 'Erro',
      message,
      color: 'red',
    });
  };

  return {
    show: showNotification,
    showSuccess,
    showError,
    clean: notifications.clean,
    cleanQueue: notifications.cleanQueue,
    update: notifications.update,
    hide: notifications.hide,
  };
}