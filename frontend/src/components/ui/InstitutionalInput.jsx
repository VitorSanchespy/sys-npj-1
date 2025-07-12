import { TextInput } from '@mantine/core';

export default function InstitutionalInput(props) {
  return (
    <TextInput
      radius="md"
      styles={{
        input: { borderColor: '#003366', fontSize: 16, background: '#fff' },
        label: { color: '#003366', fontWeight: 700, fontFamily: 'Georgia, serif' },
      }}
      {...props}
    />
  );
}