import { Modal } from '@mantine/core';

export default function InstitutionalModal({ opened, onClose, title, children, ...props }) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      radius="md"
      centered
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      styles={{
        title: { fontWeight: 900, color: '#003366', fontFamily: 'Georgia, serif' }
      }}
      {...props}
    >
      {children}
    </Modal>
  );
}