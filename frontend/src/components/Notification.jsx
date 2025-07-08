import { useEffect, useState } from 'react';
import { Notification as MantineNotification } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

export default function Notification({ message, type, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <MantineNotification
      icon={type === 'success' ? <IconCheck size={18} /> : <IconX size={18} />}
      color={type === 'success' ? 'teal' : 'red'}
      title={type === 'success' ? 'Sucesso' : 'Erro'}
      onClose={() => {
        setVisible(false);
        onClose();
      }}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
      }}
    >
      {message}
    </MantineNotification>
  );
}