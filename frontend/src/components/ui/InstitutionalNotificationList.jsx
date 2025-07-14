import { Stack } from '@mantine/core';
import InstitutionalNotification from './InstitutionalNotification';

export default function InstitutionalNotificationList({ notifications = [], ...props }) {
  return (
    <Stack gap="sm" {...props}>
      {notifications.map((notif, idx) => (
        <InstitutionalNotification key={idx} type={notif.type} message={notif.message} />
      ))}
    </Stack>
  );
}