import { Timeline as MantineTimeline, Text, Group, Badge } from '@mantine/core';
import { IconCheck, IconClock, IconAlertCircle, IconProgress } from '@tabler/icons-react';
import { formatDate } from '@/utils/formatters';

const STATUS_CONFIG = {
  completed: { icon: <IconCheck size={14} />, color: 'green' },
  pending: { icon: <IconClock size={14} />, color: 'blue' },
  delayed: { icon: <IconAlertCircle size={14} />, color: 'red' },
  in_progress: { icon: <IconProgress size={14} />, color: 'yellow' }
};

export function Timeline({ events, activeIndex = -1, showDate = true, showStatus = true }) {
  return (
    <MantineTimeline active={activeIndex} bulletSize={28} lineWidth={2} color="gray.6">
      {events.map((event, index) => {
        const { icon, color } = STATUS_CONFIG[event.status] || { icon: <IconCheck size={14} />, color: 'gray' };

        return (
          <MantineTimeline.Item 
            key={event.id || index}
            bullet={icon}
            color={color}
            title={
              <Group gap="xs">
                <Text fw={500}>{event.title}</Text>
                {showStatus && event.status && (
                  <Badge size="sm" variant="light" color={color}>
                    {event.status.replace('_', ' ')}
                  </Badge>
                )}
              </Group>
            }
          >
            <Text c="dimmed" size="sm" mb={4}>{event.description}</Text>
            {showDate && event.date && <Text size="xs" c="dimmed">{formatDate(event.date, true)}</Text>}
            {event.extra && <div style={{ marginTop: 8 }}>{event.extra}</div>}
          </MantineTimeline.Item>
        );
      })}
    </MantineTimeline>
  );
}

export default Timeline;
