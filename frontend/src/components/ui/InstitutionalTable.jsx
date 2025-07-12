import { Table } from '@mantine/core';

export default function InstitutionalTable({ children, ...props }) {
  return (
    <Table
      striped
      withColumnBorders
      highlightOnHover
      withBorder
      {...props}
      style={{
        background: '#fff',
        border: '2px solid #00336622',
        fontSize: 15,
        borderRadius: 10,
        marginBottom: 16,
        boxShadow: '0 2px 8px #00336611'
      }}
      thStyle={{ background: '#003366', color: '#ffd700', fontWeight: 700 }}
    >
      {children}
    </Table>
  );
}