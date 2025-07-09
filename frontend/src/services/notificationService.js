// src/services/notificationService.js
import { showNotification } from '@mantine/notifications';

export const setupNotifications = () => {
  console.log('Sistema de notificações inicializado');
  
  return () => {
    console.log('Sistema de notificações desativado');
  };
};

export const showErrorNotification = (message) => {
  showNotification({
    title: 'Erro',
    message,
    color: 'red',
  });
};

export const showSuccessNotification = (message) => {
  showNotification({
    title: 'Sucesso',
    message,
    color: 'teal',
  });
};