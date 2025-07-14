import { Notification } from '@mantine/core';
import { IconCheck, IconX, IconAlertCircle } from '@tabler/icons-react';

export default function InstitutionalNotification({ type = "info", message, ...props }) {
  let color = "blue";
  let icon = null;
  if (type === "success") {
    color = "teal";
    icon = <IconCheck size={20} />;
  } else if (type === "error") {
    color = "red";
    icon = <IconX size={20} />;
  } else if (type === "warning") {
    color = "yellow";
    icon = <IconAlertCircle size={20} />;
  }

  return (
    <Notification
      color={color}
      icon={icon}
      radius="md"
      styles={{
        root: { fontWeight: 700, fontFamily: 'Georgia, serif', fontSize: 16 },
        icon: { marginRight: 12 }
      }}
      {...props}
    >
      {message}
    </Notification>
  );
}