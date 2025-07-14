import { Switch } from '@mantine/core';

export default function InstitutionalSwitch(props) {
  return (
    <Switch
      radius="md"
      size="md"
      color="ufmt-green.6"
      styles={{
        track: { borderColor: '#003366' },
        thumb: { borderColor: '#003366' },
        label: { color: '#003366', fontWeight: 700, fontFamily: 'Georgia, serif' },
      }}
      {...props}
    />
  );
}