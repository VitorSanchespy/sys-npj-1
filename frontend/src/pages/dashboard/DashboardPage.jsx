import { useEffect, useState } from "react";
import { Title, Paper, Loader, Group, Stack, Text } from "@mantine/core";
import { fetchProcesses } from "@/services/processService";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/utils/formatters";

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processos, setProcessos] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetchProcesses(user?.role === "Aluno" ? { meus: true } : {})
      .then(data => setProcessos(data))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div>
      <Title order={2} mb="md">Bem-vindo, {user?.nome}!</Title>
      <Paper withBorder p="md" radius="md">
        <Group position="apart" mb="md">
          <Text size="lg" fw={500}>Seus Processos Recentes</Text>
        </Group>
        {loading ? (
          <Loader />
        ) : (
          <Stack>
            {processos.length === 0 ? (
              <Text color="dimmed">Nenhum processo encontrado.</Text>
            ) : (
              processos.slice(0, 5).map(proc => (
                <Paper withBorder p="sm" radius="sm" key={proc.id}>
                  <Group position="apart">
                    <Text fw={600}>{proc.titulo || proc.numero}</Text>
                    <Text size="sm">{formatDate(proc.dataAbertura)}</Text>
                  </Group>
                  <Text size="sm" color="dimmed">{proc.status}</Text>
                </Paper>
              ))
            )}
          </Stack>
        )}
      </Paper>
    </div>
  );
}