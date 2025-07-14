import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export default function InstitutionalAlert({ children, color = "yellow", ...props }) {
  return (
    <Alert
      icon={<IconAlertCircle size={22} />}
      color={color}
      radius="md"
      style={{
        border: `2px solid #ffd700`,
        background: '#fff8e1',
        color: '#003366',
        fontWeight: 600,
        fontFamily: 'Georgia, serif'
      }}
      {...props}
    >
      {children}
    </Alert>
  );
}