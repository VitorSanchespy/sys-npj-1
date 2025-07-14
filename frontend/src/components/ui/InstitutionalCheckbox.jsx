import { Checkbox } from '@mantine/core';

export default function InstitutionalCheckbox(props) {
  return (
    <Checkbox
      radius="md"
      color="ufmt-green.6"
      styles={{
        input: { borderColor: '#003366' },
        label: { color: '#003366', fontWeight: 700, fontFamily: 'Georgia, serif' },
      }}
      {...props}
    />
  );
}