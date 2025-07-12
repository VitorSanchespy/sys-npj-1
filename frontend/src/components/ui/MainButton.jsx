import { Button } from '@mantine/core';
import { IconGavel } from '@tabler/icons-react';

export default function MainButton({ children, ...props }) {
  return (
    <Button
      leftSection={<IconGavel size={18} />}
      radius="md"
      style={{
        background: 'linear-gradient(90deg,#003366 60%,#ffd700 100%)',
        color: '#003366',
        fontWeight: 700,
        fontSize: 16,
        letterSpacing: 0.3,
        border: '2px solid #003366',
        boxShadow: '0 1px 4px #00336622',
        transition: 'background .12s',
      }}
      {...props}
    >
      {children}
    </Button>
  );
}