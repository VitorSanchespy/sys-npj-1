import { 
  Card, SimpleGrid, Title, Text, Image, 
  Paper, Group, Progress, Badge, Center, Alert 
} from '@mantine/core';
import { Link } from 'react-router-dom';
import { 
  IconFileDescription, IconUsers, IconUser, 
  IconBuilding, IconCalendarEvent, IconAlertCircle, IconCheck
} from '@tabler/icons-react';
import api from '@/api/apiService';
import { useNotification } from '@/contexts/NotificationContext';
import { useEffect, useState } from 'react';

const featureCards = [
  { icon: <IconFileDescription size={32} />, title: "Processos Jurídicos", description: "Gerencie os processos do núcleo", link: "/processos", color: "blue" },
  { icon: <IconUsers size={32} />, title: "Gestão de Usuários", description: "Administre os usuários do sistema", link: "/usuarios", color: "violet" },
  { icon: <IconUser size={32} />, title: "Meu Perfil", description: "Atualize suas informações", link: "/perfil", color: "teal" },
  { icon: <IconBuilding size={32} />, title: "Documentos", description: "Acesse os documentos institucionais", link: "/arquivos", color: "grape" }
];

export function DashboardPage() { 
  const [state, setState] = useState({ stats: null, loading: true });
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setState({ stats: data, loading: false });
      } catch {
        showNotification('Erro ao carregar dados do dashboard', 'error');
        setState(s => ({ ...s, loading: false }));
      }
    };
    fetchData();
  }, []);

  const today = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <Stack spacing="xl">
      <Group position="apart" align="flex-end">
        <div>
          <Title order={1} color="ufmt-green.6">Painel de Controle</Title>
          <Text color="dimmed">Visão geral do sistema</Text>
        </div>
        <Badge leftSection={<IconCalendarEvent size={12} />} variant="outline">
          {today}
        </Badge>
      </Group>

      {state.stats && (
        <SimpleGrid cols={3} breakpoints={[{ maxWidth: 'md', cols: 1 }]}>
          <Paper withBorder p="md" radius="md">
            <Group position="apart">
              <Text size="sm" color="dimmed">Processos Ativos</Text>
              <Badge color="green" variant="filled">{state.stats.activeProcesses}</Badge>
            </Group>
            <Title order={3} mt="xs">{state.stats.totalProcesses}</Title>
            <Progress 
              value={(state.stats.activeProcesses / state.stats.totalProcesses) * 100} 
              mt="md" 
              size="sm" 
              color="green"
            />
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Group position="apart">
              <Text size="sm" color="dimmed">Usuários Ativos</Text>
              <Badge color="blue" variant="filled">{state.stats.activeUsers}</Badge>
            </Group>
            <Title order={3} mt="xs">{state.stats.totalUsers}</Title>
            <Progress 
              value={(state.stats.activeUsers / state.stats.totalUsers) * 100} 
              mt="md" 
              size="sm" 
              color="blue"
            />
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Group position="apart">
              <Text size="sm" color="dimmed">Documentos</Text>
              <Badge color="orange" variant="filled">Últimos 30 dias</Badge>
            </Group>
            <Title order={3} mt="xs">{state.stats.recentDocuments}</Title>
            <Text size="sm" color="dimmed" mt={2}>
              Total: {state.stats.totalDocuments}
            </Text>
          </Paper>
        </SimpleGrid>
      )}

      <Title order={3} mt="xl">Módulos do Sistema</Title>
      
      <SimpleGrid cols={4} breakpoints={[{ maxWidth: 'lg', cols: 2 }, { maxWidth: 'sm', cols: 1 }]}>
        {featureCards.map((feature, index) => (
          <Card
            key={index}
            component={Link}
            to={feature.link}
            shadow="sm"
            p="lg"
            radius="md"
            withBorder
            sx={theme => ({
              transition: 'transform 150ms ease, box-shadow 150ms ease',
              '&:hover': {
                transform: 'scale(1.01)',
                boxShadow: theme.shadows.md,
                borderColor: theme.colors[feature.color][5]
              }
            })}
          >
            <Stack align="center" spacing="sm">
              <Center sx={theme => ({
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: theme.colors[feature.color][0],
                color: theme.colors[feature.color][6]
              })}>
                {feature.icon}
              </Center>
              <Text weight={600} size="lg" mt="sm">{feature.title}</Text>
              <Text size="sm" color="dimmed" align="center">{feature.description}</Text>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      <Paper withBorder p="md" radius="md" mt="xl">
        <Group position="apart" mb="md">
          <Title order={4}>Próximos Prazos</Title>
          <Badge variant="outline" color="red">
            <Group spacing={4}><IconAlertCircle size={14} /><span>Urgente</span></Group>
          </Badge>
        </Group>
        
        {state.stats?.upcomingDeadlines?.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>Processo</th>
                <th>Descrição</th>
                <th>Prazo</th>
                <th>Dias Restantes</th>
              </tr>
            </thead>
            <tbody>
              {state.stats.upcomingDeadlines.map(deadline => (
                <tr key={deadline.id}>
                  <td>{deadline.processNumber}</td>
                  <td>{deadline.description}</td>
                  <td>{new Date(deadline.dueDate).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <Badge color={deadline.daysRemaining <= 3 ? 'red' : 'yellow'}>
                      {deadline.daysRemaining} dias
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <Alert color="green" icon={<IconCheck size={18} />}>
            Nenhum prazo urgente nos próximos dias
          </Alert>
        )}
      </Paper>

      <Image src="/npj-banner.jpg" alt="NPJ UFMT" radius="md" mt="xl" />
    </Stack>
  );
}

export default DashboardPage;