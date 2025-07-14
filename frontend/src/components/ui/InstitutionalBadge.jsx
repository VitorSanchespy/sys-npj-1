import { Badge } from '@mantine/core';

export default function InstitutionalBadge({ children, color = '#003366', ...props }) {
  return (
    <Badge
      color={color}
      radius="md"
      size="md"
      styles={{
        root: { fontWeight: 700, border: `2px solid #ffd700`, background: '#e6f0ff' },
        label: { color: color, fontFamily: 'Georgia, serif' }
      }}
      {...props}
    >
      {children}
    </Badge>
  );
}