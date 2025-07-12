import { SimpleGrid, Card, Title, Group, Box, Progress, Divider, Stack } from '@mantine/core';
import { IconFile, IconUser, IconChecklist, IconScale } from '@tabler/icons-react';
import SafeText from '@/components/ui/SafeText';
import Timeline from '@/components/ui/Timeline';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();
  
  const stats = [
    { 
      title: 'Processos Ativos', 
      value: '56', 
      icon: <IconFile size={24} />, 
      color: 'blue',
      progress: 75
    },
    { 
      title: 'Clientes Cadastrados', 
      value: '28', 
      icon: <IconUser size={24} />, 
      color: 'orange',
      progress: 60
    },
    { 
      title: 'Documentos', 
      value: '142', 
      icon: <IconChecklist size={24} />, 
      color: 'blue',
      progress: 45
    },
    { 
      title: 'Jurisprudências', 
      value: '89', 
      icon: <IconScale size={24} />, 
      color: 'blue',
      progress: 85
    },
  ];

  const recentActivities = [
    { id: 1, title: 'Novo processo cadastrado', time: 'Há 2 horas' },
    { id: 2, title: 'Documento anexado ao processo #1234', time: 'Há 4 horas' },
    { id: 3, title: 'Reunião agendada com cliente', time: 'Há 1 dia' },
    { id: 4, title: 'Atualização no sistema realizada', time: 'Há 2 dias' },
  ];

  return (
    <Box>
      <Title order={2} mb="md" style={{ color: '#003366' }}>Visão Geral</Title>
      
      <SimpleGrid cols={4} mb="xl" breakpoints={[{ maxWidth: 'lg', cols: 2 }, { maxWidth: 'sm', cols: 1 }]}>
        {stats.map((stat) => (
          <Card key={stat.title} p="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <SafeText fw={600} size="sm" style={{ color: '#003366' }}>{stat.title}</SafeText>
              <Box p={6} style={{ backgroundColor: '#e6f0ff', borderRadius: '50%' }}>
                {stat.icon}
              </Box>
            </Group>
            
            <Group align="flex-end" spacing={5} mb="xs">
              <Title order={2}>{stat.value}</Title>
            </Group>
            
            <Progress 
              value={stat.progress} 
              color={stat.color} 
              size="sm" 
              radius="xl"
              mt="sm"
            />
          </Card>
        ))}
      </SimpleGrid>
      
      <Divider my="xl" />
      
      <Group grow align="start">
        <Box style={{ flex: 2 }}>
          <Title order={3} mb="md" style={{ color: '#003366' }}>Atividades Recentes</Title>
          
          <Card withBorder radius="md">
            <Stack spacing="xs">
              {recentActivities.map((activity) => (
                <Box 
                  key={activity.id} 
                  p="sm"
                  style={{ 
                    borderLeft: '3px solid #0066CC',
                    backgroundColor: '#f8f9fa',
                    borderRadius: 4
                  }}
                >
                  <SafeText fw={500}>{activity.title}</SafeText>
                  <SafeText size="sm" style={{ color: '#666' }}>{activity.time}</SafeText>
                </Box>
              ))}
            </Stack>
          </Card>
        </Box>
        
        <Box style={{ flex: 1 }}>
          <Title order={3} mb="md" style={{ color: '#003366' }}>Linha do Tempo</Title>
          <Timeline />
        </Box>
      </Group>
      
      <Box mt="xl" p="md" style={{ backgroundColor: '#e6f0ff', borderRadius: 8 }}>
        <Title order={4} mb="sm" style={{ color: '#003366' }}>Informações do NPJ</Title>
        <SafeText>
          O Núcleo de Práticas Jurídicas da UFMT tem como objetivo proporcionar aos alunos 
          experiência prática na área jurídica, atendendo à comunidade e promovendo justiça social.
        </SafeText>
      </Box>
    </Box>
  );
}
export default DashboardPage;
