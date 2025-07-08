// components/Timeline.jsx
import { Timeline as MantineTimeline } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

export default function Timeline({ events }) {
  return (
    <MantineTimeline active={events.length - 1} bulletSize={24}>
      {events.map((event, index) => (
        <MantineTimeline.Item 
          key={index} 
          bullet={<IconCheck size={12} />}
          title={event.titulo}
        >
          <Text c="dimmed" size="sm">{event.descricao}</Text>
          <Text size="xs" mt={4}>{new Date(event.data).toLocaleString('pt-BR')}</Text>
        </MantineTimeline.Item>
      ))}
    </MantineTimeline>
  );
}