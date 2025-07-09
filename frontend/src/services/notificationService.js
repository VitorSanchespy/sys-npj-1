import io from 'socket.io-client';
import { toast } from 'react-toastify';

const socket = io(process.env.REACT_APP_SOCKET_URL);

export const setupNotifications = () => {
  socket.on('connect', () => {
    console.log('Conectado ao servidor de notificações');
  });

  socket.on('newNotification', (data) => {
    toast.info(`Nova notificação: ${data.message}`);
  });

  socket.on('error', (err) => {
    toast.error(`Erro: ${err.message}`);
  });
};

export const disconnectNotifications = () => {
  socket.disconnect();
};