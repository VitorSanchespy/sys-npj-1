import { Box } from '@mantine/core';

export default function InstitutionalSection({ children, ...props }) {
  return (
    <Box
      my="xl"
      px="md"
      style={{
        background: '#f8f9fa',
        borderRadius: 14,
        border: '1.5px solid #00336622',
        boxShadow: '0 1px 8px #00336611',
        paddingTop: 36,
        paddingBottom: 36,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}