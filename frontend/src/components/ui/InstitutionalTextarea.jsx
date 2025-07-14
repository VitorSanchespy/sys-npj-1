import { Textarea } from '@mantine/core';

export default function InstitutionalTextarea(props) {
  return (
    <Textarea
      radius="md"
      styles={{
        input: { borderColor: '#003366', fontSize: 16, background: '#fff' },
        label: { color: '#003366', fontWeight: 700, fontFamily: 'Georgia, serif' },
      }}
      autosize
      minRows={3}
      maxRows={8}
      {...props}
    />
  );
}