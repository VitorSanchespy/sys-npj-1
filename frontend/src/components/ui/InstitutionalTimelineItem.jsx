import { Timeline } from '@mantine/core';
import { IconCheck, IconAlertCircle, IconClock } from '@tabler/icons-react';

const statusIcons = {
  completed: <IconCheck size={18} color="#003366" />,
  warning: <IconAlertCircle size={18} color="#ffd700" />,
  pending: <IconClock size={18} color="#003366" />,
};

export default function InstitutionalTimelineItem({ title, status = "pending", children, ...props }) {
  return (
    <Timeline.Item
      bullet={statusIcons[status] || statusIcons.pending}
      title={<span style={{ color: '#003366', fontWeight: 700 }}>{title}</span>}
      color={status === 'warning' ? "yellow" : "#003366"}
      {...props}
    >
      {children}
    </Timeline.Item>
  );
}