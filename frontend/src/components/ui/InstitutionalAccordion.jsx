import { Accordion } from '@mantine/core';

export default function InstitutionalAccordion({ children, ...props }) {
  return (
    <Accordion
      variant="separated"
      radius="md"
      chevronPosition="right"
      styles={{
        item: { border: '2px solid #00336622', background: '#fff' },
        control: { fontWeight: 700, color: '#003366', fontFamily: 'Georgia, serif' },
        chevron: { color: '#003366' }
      }}
      {...props}
    >
      {children}
    </Accordion>
  );
}