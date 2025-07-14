import { Text, Button, Stack } from '@mantine/core';

export function EmptyState({ title, description, action }) {
  return (
    <Stack align="center" py="xl" spacing="xs">
      <Text size="lg" fw={500} ta="center">
        {title}
      </Text>

      <Text c="dimmed" ta="center">
        {description}
      </Text>

      {action && (
        <Button mt="md" size="sm" {...action.props}>
          {action.label}
        </Button>
      )}
    </Stack>
  );
}

export default EmptyState;