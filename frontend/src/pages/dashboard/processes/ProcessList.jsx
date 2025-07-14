import { useEffect, useState } from "react";
import { Table, Button, Loader, Group, Title, Paper, Badge } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { fetchProcesses } from "@/services/processService";
import { formatDate } from "@/utils/formatters";

export default function ProcessList() {
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchProcesses()
      .then(data => setProcessos(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Group justify="space-between" mb="md">
        <Title order={2}>Processos</Title>
        <Button onClick={() => navigate("/processos/novo")}>Novo Processo</Button>
      </Group>
      <Paper withBorder radius="md" p="md">
        {loading ? (
          <Loader />
        ) : (
          <Table highlightOnHover striped withColumnBorders>
            <thead>
              <tr>
                <th>Número</th>
                <th>Título</th>
                <th>Status</th>
                <th>Data de Abertura</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {processos.map(proc => (
                <tr key={proc.id}>
                  <td>{proc.numero}</td>
                  <td>{proc.titulo}</td>
                  <td><Badge color={proc.status === "ativo" ? "green" : "gray"}>{proc.status}</Badge></td>
                  <td>{formatDate(proc.dataAbertura)}</td>
                  <td>
                    <Button size="xs" onClick={() => navigate(`/processos/${proc.id}`)}>
                      Detalhes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Paper>
    </div>
  );
}