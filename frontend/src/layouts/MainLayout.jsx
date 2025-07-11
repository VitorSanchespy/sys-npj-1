// src/layouts/MainLayout.jsx
import { AppShell } from '@mantine/core';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';

export function MainLayout({ children }) {
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 280, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Header><Header /></AppShell.Header>
      <AppShell.Navbar p="md"><Navbar /></AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

export default MainLayout;