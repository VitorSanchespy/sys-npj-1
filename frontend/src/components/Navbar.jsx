// src/components/Navbar.jsx
import { Group, Button, Text } from '@mantine/core';
import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <Group justify="space-between" p="md" bg="blue" c="white">
      <Text size="xl" fw={700}>Sistema NPJ</Text>
      <Group>
        <Button component={Link} to="/" variant="outline" color="white">
          Home
        </Button>
        <Button component={Link} to="/login" variant="outline" color="white">
          Login
        </Button>
      </Group>
    </Group>
  );
}