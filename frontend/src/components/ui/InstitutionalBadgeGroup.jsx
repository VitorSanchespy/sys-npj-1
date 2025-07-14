import { Group } from '@mantine/core';
import InstitutionalBadge from './InstitutionalBadge';

export default function InstitutionalBadgeGroup({ badges = [], ...props }) {
  return (
    <Group gap="xs" {...props}>
      {badges.map((badge, idx) => (
        <InstitutionalBadge key={idx} color={badge.color || "#003366"}>
          {badge.label}
        </InstitutionalBadge>
      ))}
    </Group>
  );
}