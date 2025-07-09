import { useEffect, useState } from 'react';
import { Notification as MantineNotification } from '@mantine/core';
import { IconCheck, IconX, IconInfoCircle, IconAlertCircle } from '@tabler/icons-react';

const NOTIFICATION_TYPES = {
  success: { icon: <IconCheck size={18} />, color: 'teal', title: 'Sucesso' },
  error: { icon: <IconX size={18} />, color: 'red', title: 'Erro' },
  info: { icon: <IconInfoCircle size={18} />, color: 'blue', title: 'Informação' },
  warning: { icon: <IconAlertCircle size={18} />, color: 'orange', title: 'Aviso' }
};

export default function Notification({ 
  message, 
  type = 'info', 
  duration = 5000,
  onClose,
  position = 'bottom-right'
}) {
  const [visible, setVisible] = useState(true);
  const notificationType = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.info;

  useEffect(() => {
    if (!duration) return;
    
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  // Calcular posição baseada na prop
  const positionStyles = {
    'top-left': { top: 20, left: 20 },
    'top-right': { top: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
    'bottom-right': { bottom: 20, right: 20 },
    'top-center': { top: 20, left: '50%', transform: 'translateX(-50%)' },
    'bottom-center': { bottom: 20, left: '50%', transform: 'translateX(-50%)' }
  };

  const style = {
    position: 'fixed',
    zIndex: 1000,
    width: '350px',
    maxWidth: '90vw',
    ...positionStyles[position]
  };

  return (
    <MantineNotification
      {...notificationType}
      onClose={handleClose}
      style={style}
      withBorder
      radius="md"
    >
      {message}
    </MantineNotification>
  );
}