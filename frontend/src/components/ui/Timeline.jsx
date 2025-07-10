import { Timeline as MantineTimeline, Text, Group, Badge } from '@mantine/core';
import { 
  IconCheck, 
  IconClock, 
  IconAlertCircle, 
  IconProgress 
} from '@tabler/icons-react';
import { formatDate } from '@/utils/formatters';

const STATUS_ICONS = {
  completed: <IconCheck size={14} />,
  pending: <IconClock size={14} />,
  delayed: <IconAlertCircle size={14} />,
  in_progress: <IconProgress size={14} />
};

const STATUS_COLORS = {
  completed: 'green',
  pending: 'blue',
  delayed: 'red',
  in_progress: 'yellow'
};

export default function Timeline({ 
  events, 
  activeIndex = -1,
  showDate = true,
  showStatus = true
}) {
  return (
    <MantineTimeline 
      active={activeIndex}
      bulletSize={28}
      lineWidth={2}
      color="gray.6"
    >
      {events.map((event, index) => (
        <MantineTimeline.Item 
          key={event.id || index}
          bullet={STATUS_ICONS[event.status] || <IconCheck size={14} />}
          color={STATUS_COLORS[event.status] || 'gray'}
          title={
            <Group gap="xs">
              <Text fw={500}>{event.title}</Text>
              {showStatus && event.status && (
                <Badge 
                  size="sm" 
                  variant="light" 
                  color={STATUS_COLORS[event.status]}
                >
                  {event.status.replace('_', ' ')}
                </Badge>
              )}
            </Group>
          }
        >
          <Text c="dimmed" size="sm" mb={4}>
            {event.description}
          </Text>
          
          {showDate && event.date && (
            <Text size="xs" c="dimmed">
              {formatDate(event.date, true)}
            </Text>
          )}
          
          {event.extra && (
            <div style={{ marginTop: 8 }}>
              {event.extra}
            </div>
          )}
        </MantineTimeline.Item>
      ))}
    </MantineTimeline>
  );
}