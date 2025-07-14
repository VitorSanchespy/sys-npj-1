import { useEffect, useState } from 'react';
import { Title, Paper, Loader, Table, Button, Group, Badge } from '@mantine/core';
import { fetchFilesByProcess, deleteFile } from '@/services/fileService';

export function FilesPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const processoId = null; // ajuste para obter processoId conforme contexto do seu sistema

  useEffect(() => {
    if (processoId) {
      setLoading(true);
      fetchFilesByProcess(processoId)
        .then(data => setFiles(data))
        .finally(() => setLoading(false));
    }
  }, [processoId]);

  return (
    <div>
      <Title order={2} mb="md">Arquivos do Processo</Title>
      <Paper withBorder radius="md" p="md">
        {loading ? (
          <Loader />
        ) : (
          <Table striped withColumnBorders>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Data de Upload</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {files.map(file => (
                <tr key={file.id}>
                  <td>{file.nome}</td>
                  <td><Badge>{file.tipo}</Badge></td>
                  <td>{file.createdAt}</td>
                  <td>
                    <Group>
                      <Button size="xs" component="a" href={file.url} target="_blank">
                        Baixar
                      </Button>
                      <Button size="xs" color="red" onClick={() => deleteFile(file.id)}>
                        Excluir
                      </Button>
                    </Group>
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
export default FilesPage;