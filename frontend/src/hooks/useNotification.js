// src/hooks/useNotification.js
import { notifications } from '@mantine/notifications';

export function useNotification() {
  return {
    show: notifications.show,
    showSuccess: message => notifications.show({ title: 'Sucesso', message, color: 'green' }),
    showError: message => notifications.show({ title: 'Erro', message, color: 'red' }),
    clean: notifications.clean,
    cleanQueue: notifications.cleanQueue,
    update: notifications.update,
    hide: notifications.hide
  };
}

export default useNotification;