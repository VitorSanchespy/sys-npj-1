import { Card, Text } from '@mantine/core';

export default function InstitutionalCardSection({ title, children, ...props }) {
  return (
    <Card.Section
      inheritPadding
      py="md"
      style={{
        background: '#f8f9fa',
        borderBottom: '1.5px solid #00336622'
      }}
      {...props}
    >
      {title && (
        <Text fw={700} size="md" color="#003366" mb={8}>
          {title}
        </Text>
      )}
      {children}
    </Card.Section>
  );
}