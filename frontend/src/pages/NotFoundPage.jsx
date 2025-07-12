import { Title, Button, Box, Center, Group } from '@mantine/core';
import { IconHome, IconSchool } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import SafeText from '@/components/ui/SafeText';

export function NotFoundPage() {
  const navigate = useNavigate();
  
  return (
    <Center style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #f8f9fa, #e6f0ff)'
    }}>
      <IconSchool size={80} color="#0066CC" style={{ marginBottom: 20 }} />
      
      <Title order={1} size="3rem" mb="md" c="#003366">Página Não Encontrada</Title>
      
      <SafeText size="xl" mb="xl" maw={600}>
        A página que você está procurando não existe ou foi movida. 
        Volte para o dashboard ou acesse outra seção do sistema.
      </SafeText>
      
      <Group>
        <Button 
          leftSection={<IconHome size={18} />}
          onClick={() => navigate('/')}
          color="#0066CC"
          size="md"
        >
          Página Inicial
        </Button>
        <Button 
          variant="outline" 
          color="#0066CC"
          onClick={() => navigate(-1)}
          size="md"
        >
          Voltar
        </Button>
      </Group>
      
      <Box mt="xl" p="md" style={{ backgroundColor: 'white', borderRadius: 8, maxWidth: 600 }}>
        <SafeText size="sm" c="dimmed">
          Universidade Federal de Mato Grosso • Núcleo de Práticas Jurídicas
        </SafeText>
        <SafeText size="sm" c="dimmed">
          Av. Fernando Corrêa da Costa, 2367 - Boa Esperança, Cuiabá - MT, 78060-900
        </SafeText>
      </Box>
    </Center>
  );
}
export default NotFoundPage;