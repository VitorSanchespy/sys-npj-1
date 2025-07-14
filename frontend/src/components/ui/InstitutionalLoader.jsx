import { Loader, Center } from '@mantine/core';

export default function InstitutionalLoader({ size = "lg", ...props }) {
  return (
    <Center py="xl">
      <Loader color="#003366" size={size} {...props} />
    </Center>
  );
}