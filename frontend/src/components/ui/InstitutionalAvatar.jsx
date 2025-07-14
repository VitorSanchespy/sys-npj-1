import { Avatar } from '@mantine/core';

export default function InstitutionalAvatar({ src, alt, ...props }) {
  return (
    <Avatar
      src={src}
      alt={alt}
      radius="xl"
      size="lg"
      styles={{
        root: { border: '2px solid #003366', background: '#f8f9fa' }
      }}
      {...props}
    />
  );
}