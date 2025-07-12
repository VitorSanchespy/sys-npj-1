import { Card, Group, Text, Box } from '@mantine/core';
import { IconScale } from '@tabler/icons-react';

export default function InstitutionalCard({ title, children }) {
  return (
    <Card
      shadow="sm"
      radius="md"
      withBorder
      style={{
        border: '2px solid #00336622',
        background: '#fff',
        marginBottom: 18,
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <Box style={{
        position: 'absolute',
        top: -22, left: 18,
        background: '#fff',
        borderRadius: '50%',
        border: '2.5px solid #ffd700',
        padding: 6,
        boxShadow: '0 2px 8px #00336622'
      }}>
        <IconScale size={28} color="#003366" />
      </Box>
      <Text fw={700} size="lg" mt={18} mb="xs" style={{ color: '#003366', fontFamily: 'Georgia, serif', marginLeft: 38 }}>
        {title}
      </Text>
      <Text size="md">{children}</Text>
    </Card>
  );
}