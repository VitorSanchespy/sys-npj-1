import { Progress, Text, Box } from '@mantine/core';

export default function InstitutionalProgress({ label, value, color = "#003366", ...props }) {
  return (
    <Box my="md">
      {label && (
        <Text fw={700} size="sm" mb={4} style={{ color: color, fontFamily: 'Georgia, serif' }}>
          {label}
        </Text>
      )}
      <Progress
        value={value}
        color={color}
        radius="md"
        size="lg"
        styles={{
          bar: { backgroundColor: color },
          root: { background: '#e6f0ff' }
        }}
        {...props}
      />
    </Box>
  );
}