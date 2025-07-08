// src/pages/Home.jsx
import React from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Button, 
  Group, 
  Image, 
  SimpleGrid, 
  Card, 
  Center, 
  Badge,
  useMantineTheme
} from '@mantine/core';
import { IconScale, IconFileDescription, IconUsers, IconBuilding, IconCalendar, IconLock } from '@tabler/icons-react';

export default function Home() {
  const theme = useMantineTheme();
  
  const features = [
    {
      icon: <IconScale size={36} color={theme.colors.blue[6]} />,
      title: "Gestão de Processos",
      description: "Controle completo de todos os processos jurídicos em andamento."
    },
    {
      icon: <IconFileDescription size={36} color={theme.colors.blue[6]} />,
      title: "Documentação Digital",
      description: "Armazene e acesse todos os documentos relacionados aos processos."
    },
    {
      icon: <IconUsers size={36} color={theme.colors.blue[6]} />,
      title: "Gestão de Clientes",
      description: "Cadastro e acompanhamento de clientes e partes envolvidas."
    },
    {
      icon: <IconCalendar size={36} color={theme.colors.blue[6]} />,
      title: "Controle de Prazos",
      description: "Alertas automáticos para prazos processuais importantes."
    }
  ];

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: '#001F3F', 
        padding: '20px 0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <Container size="xl">
          <Group position="apart">
            <Group>
              <Image 
                src="/ufmt-logo.png" 
                alt="UFMT Logo" 
                width={60}
                withPlaceholder
              />
              <Title order={3} style={{ color: 'white', fontWeight: 700 }}>
                Sistema NPJ - UFMT
              </Title>
            </Group>
            <Group>
              <Button 
                variant="outline" 
                color="gray.2"
                leftIcon={<IconLock size={18} />}
                component="a"
                href="/login"
              >
                Área Restrita
              </Button>
            </Group>
          </Group>
        </Container>
      </header>

      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #001F3F 0%, #003366 100%)', 
        color: 'white',
        padding: '80px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container size="xl">
          <SimpleGrid cols={2} spacing="xl" breakpoints={[{ maxWidth: 'md', cols: 1 }]}>
            <div>
              <Badge variant="filled" size="lg" mb="md">Núcleo de Práticas Jurídicas</Badge>
              <Title order={1} style={{ lineHeight: 1.2, marginBottom: 20 }}>
                Gestão Inteligente de Processos Jurídicos
              </Title>
              <Text size="xl" style={{ marginBottom: 30, maxWidth: 600 }}>
                Plataforma completa para gestão de processos, clientes e documentos do NPJ da Universidade Federal de Mato Grosso.
              </Text>
              <Group>
                <Button 
                  size="lg" 
                  variant="light"
                  component="a"
                  href="/login"
                >
                  Acessar o Sistema
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  color="gray.2"
                >
                  Saiba Mais
                </Button>
              </Group>
            </div>
            <Center>
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '20px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <Image 
                  src="/law-illustration.png" 
                  alt="Legal Process Illustration" 
                  width={400}
                  withPlaceholder
                />
              </div>
            </Center>
          </SimpleGrid>
        </Container>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 0' }}>
        <Container size="xl">
          <Title order={2} align="center" mb="xl" style={{ color: '#001F3F' }}>
            Funcionalidades do Sistema
          </Title>
          
          <SimpleGrid cols={4} spacing="xl" breakpoints={[
            { maxWidth: 'lg', cols: 2, spacing: 'md' },
            { maxWidth: 'sm', cols: 1, spacing: 'sm' }
          ]}>
            {features.map((feature, index) => (
              <Card 
                key={index} 
                shadow="sm" 
                padding="lg" 
                radius="md" 
                withBorder
                style={{ 
                  borderTop: `4px solid ${theme.colors.blue[6]}`,
                  transition: 'transform 0.3s ease'
                }}
                sx={{
                  '&:hover': {
                    transform: 'translateY(-10px)'
                  }
                }}
              >
                <Center mb="md">
                  {feature.icon}
                </Center>
                <Title order={4} align="center" mb="sm" style={{ color: '#001F3F' }}>
                  {feature.title}
                </Title>
                <Text align="center" color="dimmed">
                  {feature.description}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </section>

      {/* About Section */}
      <section style={{ 
        backgroundColor: '#eef2f7', 
        padding: '80px 0',
        borderTop: '1px solid #e0e0e0',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Container size="xl">
          <SimpleGrid cols={2} spacing="xl" breakpoints={[{ maxWidth: 'md', cols: 1 }]}>
            <div>
              <Image 
                src="/ufmt-campus.jpg" 
                alt="UFMT Campus" 
                radius="md"
                withPlaceholder
              />
            </div>
            <div>
              <Title order={2} mb="md" style={{ color: '#001F3F' }}>
                Sobre o NPJ da UFMT
              </Title>
              <Text size="lg" mb="md">
                O Núcleo de Práticas Jurídicas da Universidade Federal de Mato Grosso é um espaço de aprendizado 
                prático para estudantes de Direito, oferecendo assistência jurídica gratuita à comunidade.
              </Text>
              <Text size="lg" mb="xl">
                Este sistema foi desenvolvido para otimizar a gestão de processos, permitindo que estudantes e 
                professores acompanhem casos, prazos e documentos de forma eficiente e segura.
              </Text>
              <Button 
                variant="outline" 
                color="blue"
                size="md"
              >
                Conheça o NPJ
              </Button>
            </div>
          </SimpleGrid>
        </Container>
      </section>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: '#001F3F', 
        color: 'white',
        padding: '50px 0 30px'
      }}>
        <Container size="xl">
          <SimpleGrid cols={4} spacing="xl" breakpoints={[
            { maxWidth: 'lg', cols: 2 },
            { maxWidth: 'sm', cols: 1 }
          ]}>
            <div>
              <Title order={4} mb="md" style={{ color: 'white' }}>
                Sistema NPJ
              </Title>
              <Text>
                Plataforma de gestão de processos do Núcleo de Práticas Jurídicas da Universidade Federal de Mato Grosso.
              </Text>
            </div>
            <div>
              <Title order={4} mb="md" style={{ color: 'white' }}>
                Links Úteis
              </Title>
              <Text component="a" href="#" display="block" py={5}>Acesso ao Sistema</Text>
              <Text component="a" href="#" display="block" py={5}>Documentação</Text>
              <Text component="a" href="#" display="block" py={5}>Suporte</Text>
            </div>
            <div>
              <Title order={4} mb="md" style={{ color: 'white' }}>
                Contato
              </Title>
              <Text>Av. Fernando Corrêa da Costa, 2367</Text>
              <Text>Boa Esperança, Cuiabá - MT</Text>
              <Text>CEP: 78060-900</Text>
              <Text>npj@ufmt.br</Text>
            </div>
            <div>
              <Title order={4} mb="md" style={{ color: 'white' }}>
                Legal
              </Title>
              <Text component="a" href="#" display="block" py={5}>Termos de Uso</Text>
              <Text component="a" href="#" display="block" py={5}>Política de Privacidade</Text>
              <Text component="a" href="#" display="block" py={5}>Acessibilidade</Text>
            </div>
          </SimpleGrid>
          
          <div style={{ 
            borderTop: '1px solid rgba(255,255,255,0.1)', 
            marginTop: 40, 
            paddingTop: 20,
            textAlign: 'center'
          }}>
            <Text color="gray.5">
              © {new Date().getFullYear()} Universidade Federal de Mato Grosso - NPJ. Todos os direitos reservados.
            </Text>
          </div>
        </Container>
      </footer>
    </div>
  );
}