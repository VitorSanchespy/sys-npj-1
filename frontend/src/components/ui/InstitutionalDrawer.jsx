import { Drawer } from '@mantine/core';

export default function InstitutionalDrawer({ opened, onClose, title, children, ...props }) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={title}
      radius="md"
      styles={{
        title: { color: '#003366', fontWeight: 800, fontFamily: 'Georgia, serif' }
      }}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      {...props}
    >
      {children}
    </Drawer>
  );
}