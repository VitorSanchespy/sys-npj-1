import { Tabs } from '@mantine/core';

export default function InstitutionalTabs({ children, ...props }) {
  return (
    <Tabs
      color="#003366"
      radius="md"
      variant="outline"
      styles={{
        tab: {
          fontWeight: 700,
          fontSize: 16,
          fontFamily: 'Georgia, serif',
        },
        list: {
          borderBottom: '2px solid #00336622'
        }
      }}
      {...props}
    >
      {children}
    </Tabs>
  );
}