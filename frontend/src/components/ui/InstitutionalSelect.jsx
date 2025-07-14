import { Select } from '@mantine/core';

export default function InstitutionalSelect(props) {
  return (
    <Select
      radius="md"
      styles={{
        input: { borderColor: '#003366', fontSize: 16, background: '#fff' },
        label: { color: '#003366', fontWeight: 700, fontFamily: 'Georgia, serif' },
        dropdown: { border: '2px solid #00336622' }
      }}
      {...props}
    />
  );
}