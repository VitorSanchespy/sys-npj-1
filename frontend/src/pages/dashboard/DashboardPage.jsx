import { Grid, Text, Loader } from '@mantine/core';
import InstitutionalCard from '@/components/ui/InstitutionalCard';
import InstitutionalTable from '@/components/ui/InstitutionalTable';
import { useProcessos } from '@/hooks/useProcessos';

export default function DashboardPage() {
  const { processos, loading } = useProcessos();

  return (
    <Grid>
      <Grid.Col span={4}>
        <InstitutionalCard title="Processos Abertos">
          {loading ? <Loader /> : (
            <Text size="xl" fw={800} c="#003366">{processos.length}</Text>
          )}
        </InstitutionalCard>
      </Grid.Col>
      <Grid.Col span={8}>
        <InstitutionalCard title="Últimos Processos">
          {loading ? <Loader /> : (
            <InstitutionalTable>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Data</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {processos.slice(0, 5).map(proc => (
                  <tr key={proc.id}>
                    <td>{proc.numero}</td>
                    <td>{proc.data_inicio}</td>
                    <td>{proc.status}</td>
                  </tr>
                ))}
              </tbody>
            </InstitutionalTable>
          )}
        </InstitutionalCard>
      </Grid.Col>
    </Grid>
  );
}