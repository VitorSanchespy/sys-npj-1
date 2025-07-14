import { Timeline as MantineTimeline, Text, Group, Badge, Box, Center } from '@mantine/core';
import { IconCheck, IconClock, IconAlertCircle, IconProgress, IconInfoCircle } from '@tabler/icons-react';
import { formatDate } from '@/utils/formatters';

const STATUS_CONFIG = {
  completed: { icon: <IconCheck size={16} />, color: 'teal' },
  pending: { icon: <IconClock size={16} />, color: 'blue' },
  delayed: { icon: <IconAlertCircle size={16} />, color: 'red' },
  in_progress: { icon: <IconProgress size={16} />, color: 'yellow' }
};

export function Timeline({ events = [], activeIndex = -1, showDate = true, showStatus = true }) {
  return (
    <MantineTimeline
      active={activeIndex}
      bulletSize={32}
      lineWidth={4}
      color="ufmt-blue.5"
      styles={{
        item: {
          background: '#f8faff',
          borderRadius: 12,
          boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
          marginBottom: 18
        },
        bullet: {
          background: '#e6f0ff',
          border: '2px solid #003366',
        },
        line: {
          background: 'linear-gradient(180deg, #003366 0%, #e6f0ff 100%)'
        }
      }}
    >
      {events.length === 0 ? (
        <MantineTimeline.Item
          bullet={<IconInfoCircle size={20} color="#003366" />}
          color="gray"
          title={
            <Text fw={600} c="#003366">Nada para exibir ainda</Text>
          }
        >
          <Center>
            <Text c="dimmed" size="sm" p={10}>
              Nenhum evento registrado nesta linha do tempo.
            </Text>
          </Center>
        </MantineTimeline.Item>
      ) : (
        events.map((event, index) => {
          const { icon, color } = STATUS_CONFIG[event.status] || { icon: <IconCheck size={16} />, color: 'gray' };
          return (
            <MantineTimeline.Item
              key={event.id || index}
              bullet={icon}
              color={color}
              title={
                <Group gap="xs">
                  <Text fw={600} c="#003366">{event.title}</Text>
                  {showStatus && event.status && (
                    <Badge size="sm" variant="light" color={color}>
                      {event.status.replace('_', ' ')}
                    </Badge>
                  )}
                </Group>
              }
            >
              <Box>
                {event.description && (
                  <Text c="dimmed" size="sm" mb={4}>{event.description}</Text>
                )}
                {showDate && event.date && (
                  <Text size="xs" c="blue.7">{formatDate(event.date, true)}</Text>
                )}
                {event.extra && <Box mt={8}>{event.extra}</Box>}
              </Box>
            </MantineTimeline.Item>
          );
        })
      )}
    </MantineTimeline>
  );
}

export default Timeline;