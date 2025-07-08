import { Text, Button, Group } from '@mantine/core';

export default function EmptyState({ title, description, action }) {
  return (
    <Group direction="column" position="center" py="xl" spacing="xs">
      <Text size="lg" weight={500}>{title}</Text>
      <Text color="dimmed" align="center">{description}</Text>
      {action && (
        <Button mt="md" size="sm" {...action.props}>
          {action.label}
        </Button>
      )}
    </Group>
  );
}