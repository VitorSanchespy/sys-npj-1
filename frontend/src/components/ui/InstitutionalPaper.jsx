import { Paper } from '@mantine/core';

export default function InstitutionalPaper({ children, ...props }) {
  return (
    <Paper
      radius="md"
      shadow="sm"
      p="xl"
      style={{
        background: '#fff',
        border: '2px solid #00336622',
        marginBottom: 18,
        boxShadow: '0 2px 8px #00336611'
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}