import { useEffect, useState } from 'react';
import { Notification as MantineNotification } from '@mantine/core';
import { IconCheck, IconX, IconInfoCircle } from '@tabler/icons-react';

const NOTIFICATION_TYPES = {
  success: { icon: <IconCheck size={18} />, color: 'teal', title: 'Sucesso' },
  error: { icon: <IconX size={18} />, color: 'red', title: 'Erro' },
  info: { icon: <IconInfoCircle size={18} />, color: 'blue', title: 'Informação' }
};

export default function Notification({ message, type = 'info', onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  return (
    <MantineNotification
      {...NOTIFICATION_TYPES[type]}
      onClose={handleClose}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        width: '350px',
        maxWidth: '90vw'
      }}
    >
      {message}
    </MantineNotification>
  );
}