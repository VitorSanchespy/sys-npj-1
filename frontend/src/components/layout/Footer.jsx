import { Box, Group, Text } from '@mantine/core';
import { IconScale } from '@tabler/icons-react';

export default function Footer() {
  return (
    <Box
      style={{
        background: '#003366',
        borderTop: '4px solid #ffd700',
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'Roboto, Segoe UI, Arial, sans-serif',
        fontSize: 16,
        padding: '20px 0',
        fontWeight: 500,
      }}
    >
      <Group gap={10} justify="center">
        <IconScale size={22} color="#ffd700" />
        <span>
          Sistema NPJ • Universidade Federal de Mato Grosso
        </span>
        <span style={{ color: '#ffd700', fontWeight: 700, marginLeft: 10 }}>
          {new Date().getFullYear()}
        </span>
      </Group>
    </Box>
  );
}