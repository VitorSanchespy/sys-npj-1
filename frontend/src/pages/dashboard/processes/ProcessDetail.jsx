import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Paper, Title, Text, Group, Button, Loader, Badge, Stack, Table } from "@mantine/core";
import { fetchProcessById } from "@/services/processService";
import { formatDate } from "@/utils/formatters";

export default function ProcessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [processo, setProcesso] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProcessById(id)
      .then(data => setProcesso(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!processo) return <Text>Processo não encontrado.</Text>;

  return (
    <Paper withBorder p="xl" radius="md">
      <Group justify="space-between" mb="xl">
        <Button variant="subtle" onClick={() => navigate("/processos")}>Voltar</Button>
        <Title order={2}>Processo {processo.numero}</Title>
      </Group>
      <Stack>
        <Text><b>Status:</b> <Badge color={processo.status === "ativo" ? "green" : "gray"}>{processo.status}</Badge></Text>
        <Text><b>Título:</b> {processo.titulo}</Text>
        <Text><b>Data de abertura:</b> {formatDate(processo.dataAbertura)}</Text>
        <Text><b>Descrição:</b> {processo.descricao}</Text>
        <Text><b>Alunos vinculados:</b></Text>
        <ul>
          {(processo.alunos || []).map(aluno => (
            <li key={aluno.id}>{aluno.nome}</li>
          ))}
        </ul>
        <Text><b>Atualizações:</b></Text>
        <Table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {(processo.atualizacoes || []).map(at => (
              <tr key={at.id}>
                <td>{formatDate(at.data)}</td>
                <td>{at.descricao}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Stack>
    </Paper>
  );
}