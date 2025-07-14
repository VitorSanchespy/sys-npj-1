import { Popover } from '@mantine/core';

export default function InstitutionalPopover({ children, ...props }) {
  return (
    <Popover
      radius="md"
      shadow="md"
      styles={{
        dropdown: { border: '2px solid #00336622', background: '#fff' }
      }}
      {...props}
    >
      {children}
    </Popover>
  );
}