import { useEffect, useState } from 'react';
import { Notification as MantineNotification } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

export function Notification({ 
  message, 
  type = 'info', 
  duration = 3000,
  onClose
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const icons = {
    success: <IconCheck size={16} />,
    error: <IconX size={16} />,
    info: null,
  };

  const colors = {
    success: 'teal',
    error: 'red',
    info: 'blue',
  };

  return (
    <MantineNotification
      icon={icons[type]}
      color={colors[type]}
      onClose={() => {
        setVisible(false);
        onClose?.();
      }}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        width: 300
      }}
    >
      {message}
    </MantineNotification>
  );
}

export default Notification;