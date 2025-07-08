import { useEffect, useState } from 'react';
import { Table, Button, Group, TextInput, Select } from '@mantine/core';
import { IconSearch, IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { getProcesses, assignStudent } from '../../../services/api';
import { useNavigate } from 'react-router-dom';

export default function ProcessList() {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const response = await getProcesses();
        setProcesses(response.data);
      } catch (error) {
        console.error('Error fetching processes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProcesses();
  }, []);

  const handleAssignStudent = async (processoId, alunoId) => {
    try {
      await assignStudent(processoId, alunoId);
      // Atualizar lista ou mostrar notificação
    } catch (error) {
      console.error('Error assigning student:', error);
    }
  };

  const filteredProcesses = processes.filter(process =>
    process.numero_processo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Group position="apart" mb="md">
        <TextInput
          placeholder="Buscar processos..."
          icon={<IconSearch size={14} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button leftIcon={<IconPlus size={14} />} onClick={() => navigate('/processos/novo')}>
          Novo Processo
        </Button>
      </Group>

      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Número</th>
            <th>Descrição</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredProcesses.map(process => (
            <tr key={process.id}>
              <td>{process.numero_processo}</td>
              <td>{process.descricao}</td>
              <td>{process.status}</td>
              <td>
                <Group spacing="xs">
                  <Button 
                    compact 
                    variant="light" 
                    leftIcon={<IconEdit size={14} />}
                    onClick={() => navigate(`/processos/${process.id}`)}
                  >
                    Editar
                  </Button>
                  <Button 
                    compact 
                    color="red" 
                    variant="light" 
                    leftIcon={<IconTrash size={14} />}
                  >
                    Remover
                  </Button>
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}