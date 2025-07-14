import { Radio } from '@mantine/core';

export default function InstitutionalRadioGroup(props) {
  return (
    <Radio.Group
      spacing="md"
      styles={{
        label: { color: '#003366', fontWeight: 700, fontFamily: 'Georgia, serif' },
      }}
      {...props}
    />
  );
}