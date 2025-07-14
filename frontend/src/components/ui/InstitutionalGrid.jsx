import { SimpleGrid } from '@mantine/core';

export default function InstitutionalGrid({ cols = 2, spacing = "md", breakpoints, children, ...props }) {
  return (
    <SimpleGrid
      cols={cols}
      spacing={spacing}
      breakpoints={breakpoints || [
        { maxWidth: 'md', cols: 1 }
      ]}
      {...props}
    >
      {children}
    </SimpleGrid>
  );
}