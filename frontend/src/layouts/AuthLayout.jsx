// src/layouts/AuthLayout.jsx
import { AppShell, Box } from '@mantine/core';
import Header from '@/components/Header';

export default function AuthLayout({ children }) {
  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Header />
      </AppShell.Header>
      <AppShell.Main>
        <Box maw={400} mx="auto" mt="xl">
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}