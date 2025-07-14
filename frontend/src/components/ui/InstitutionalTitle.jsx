import { Title } from '@mantine/core';

export default function InstitutionalTitle({ order = 2, children, ...props }) {
  return (
    <Title
      order={order}
      style={{
        color: '#003366',
        fontWeight: 900,
        fontFamily: 'Georgia, serif',
        letterSpacing: -1
      }}
      {...props}
    >
      {children}
    </Title>
  );
}