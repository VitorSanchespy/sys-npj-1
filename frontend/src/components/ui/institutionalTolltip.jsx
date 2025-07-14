import { Tooltip } from '@mantine/core';

export default function InstitutionalTooltip({ children, label, ...props }) {
  return (
    <Tooltip
      label={label}
      color="#003366"
      withArrow
      arrowSize={7}
      styles={{
        tooltip: { backgroundColor: '#003366', color: '#ffd700', fontWeight: 600 }
      }}
      {...props}
    >
      {children}
    </Tooltip>
  );
}