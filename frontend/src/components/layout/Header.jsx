import { Box, Group, Text } from '@mantine/core';
import { IconScale, IconGavel } from '@tabler/icons-react';

export default function Header() {
  return (
    <Box
      style={{
        background: '#003366',
        height: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '4px solid #ffd700', // dourado judiciário
        boxShadow: '0 2px 8px #00336611',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Group gap={12}>
        <img
          src="/ufmt-logo-branca.png" // Use a logo branca institucional da UFMT
          alt="Logo UFMT"
          style={{
            height: 54,
            width: 'auto',
            display: 'block',
            marginRight: 18,
          }}
          draggable={false}
        />
        <IconScale size={38} color="#ffd700" stroke={1.5} /> {/* balança do Judiciário */}
        <Text
          fw={800}
          style={{
            color: '#fff',
            fontFamily: 'Georgia, serif',
            fontSize: 30,
            letterSpacing: 1,
            textShadow: '0 1px 8px #00336677'
          }}
        >
          Sistema NPJ <span style={{ color: '#ffd700', fontWeight: 700 }}>• UFMT</span>
        </Text>
        <IconGavel size={36} color="#ffd700" stroke={1.5} /> {/* martelo do Judiciário */}
      </Group>
    </Box>
  );
}