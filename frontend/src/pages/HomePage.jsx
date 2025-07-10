import { 
  Container, Title, Text, Button, Group, 
  Image, SimpleGrid, Card, Center, Badge, Anchor
} from '@mantine/core';
import { 
  IconScale, IconFileDescription, IconUsers, 
  IconBuilding, IconCalendar, IconLock, IconExternalLink
} from '@tabler/icons-react';
import Head from 'next/head';
import { useViewportSize } from '@mantine/hooks';

const features = [
  { icon: <IconScale size={36} />, title: "Gestão de Processos", description: "Controle completo de todos os processos jurídicos em andamento." },
  { icon: <IconFileDescription size={36} />, title: "Documentação Digital", description: "Armazene e acesse todos os documentos relacionados aos processos." },
  { icon: <IconUsers size={36} />, title: "Gestão de Clientes", description: "Cadastro e acompanhamento de clientes e partes envolvidas." },
  { icon: <IconCalendar size={36} />, title: "Controle de Prazos", description: "Alertas automáticos para prazos processuais importantes." }
];

export function Home() {
  const { width } = useViewportSize();
  const isMobile = width < 768;
  const today = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <>
      <Head>
        <title>Sistema NPJ - UFMT | Gestão de Processos Jurídicos</title>
        <meta name="description" content="Plataforma de gestão de processos do Núcleo de Práticas Jurídicas da UFMT" />
      </Head>

      {/* Header */}
      <header style={{ backgroundColor: '#001F3F', padding: '20px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <Container size="xl">
          <Group position="apart">
            <Group spacing="xs">
              <Image src="/ufmt-logo-white.png" alt="UFMT Logo" width={isMobile ? 40 : 60} />
              <Title order={isMobile ? 5 : 3} style={{ color: 'white', fontWeight: 700 }}>
                Sistema NPJ - UFMT
              </Title>
            </Group>
            <Button 
              variant="outline" 
              color="gray.2"
              leftIcon={<IconLock size={18} />}
              component="a"
              href="/login"
              size={isMobile ? 'sm' : 'md'}
            >
              Área Restrita
            </Button>
          </Group>
        </Container>
      </header>

      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #001F3F 0%, #003366 100%)', padding: isMobile ? '60px 0' : '80px 0' }}>
        <Container size="xl">
          <SimpleGrid cols={2} spacing="xl" breakpoints={[{ maxWidth: 'md', cols: 1 }]}>
            <div>
              <Badge variant="filled" size="lg" mb="md" bg="#1e6feb">
                Núcleo de Práticas Jurídicas
              </Badge>
              <Title order={1} mb={20} style={{ fontSize: isMobile ? '2rem' : '3rem', lineHeight: 1.2 }}>
                Gestão Inteligente de Processos Jurídicos
              </Title>
              <Text size={isMobile ? 'md' : 'xl'} mb={30} maw={600}>
                Plataforma completa para gestão de processos, clientes e documentos do NPJ da UFMT.
              </Text>
              <Group>
                <Button 
                  size={isMobile ? 'md' : 'lg'}
                  variant="light"
                  component="a"
                  href="/login"
                  bg="rgba(255,255,255,0.9)"
                >
                  Acessar o Sistema
                </Button>
                <Button 
                  size={isMobile ? 'md' : 'lg'}
                  variant="outline" 
                  color="gray.2"
                  rightIcon={<IconExternalLink size={16} />}
                  component="a"
                  href="https://ufmt.br/npj"
                  target="_blank"
                >
                  Saiba Mais
                </Button>
              </Group>
            </div>
            {!isMobile && (
              <Center>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 20, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <Image src="/law-illustration.png" alt="Legal Process Illustration" width={400} />
                </div>
              </Center>
            )}
          </SimpleGrid>
        </Container>
      </section>

      {/* Features Section */}
      <section style={{ padding: isMobile ? '50px 0' : '80px 0' }}>
        <Container size="xl">
          <Title order={2} align="center" mb="xl" c="#001F3F">
            Funcionalidades do Sistema
          </Title>
          
          <SimpleGrid cols={4} spacing="xl" breakpoints={[{ maxWidth: 'lg', cols: 2 }, { maxWidth: 'sm', cols: 1 }]}>
            {features.map((feature, index) => (
              <Card 
                key={index} 
                shadow="sm" 
                p="lg" 
                radius="md" 
                withBorder
                style={{ 
                  borderTop: '4px solid #1e6feb',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': { transform: 'translateY(-10px)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }
                }}
              >
                <Center mb="md" c="#1e6feb">
                  {feature.icon}
                </Center>
                <Title order={4} align="center" mb="sm" c="#001F3F">
                  {feature.title}
                </Title>
                <Text align="center" c="dimmed">
                  {feature.description}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </section>

      {/* About Section */}
      <section style={{ background: '#f8f9fa', padding: isMobile ? '50px 0' : '80px 0' }}>
        <Container size="xl">
          <SimpleGrid cols={2} spacing="xl" breakpoints={[{ maxWidth: 'md', cols: 1 }]}>
            <Image src="/ufmt-campus.jpg" alt="UFMT Campus" radius="md" />
            <div>
              <Title order={2} mb="md" c="#001F3F">
                Sobre o NPJ da UFMT
              </Title>
              <Text size={isMobile ? 'md' : 'lg'} mb="md">
                O Núcleo de Práticas Jurídicas da UFMT é um espaço de aprendizado 
                prático para estudantes de Direito, oferecendo assistência jurídica gratuita à comunidade.
              </Text>
              <Text size={isMobile ? 'md' : 'lg'} mb="xl">
                Este sistema otimiza a gestão de processos, permitindo que estudantes e 
                professores acompanhem casos, prazos e documentos de forma eficiente e segura.
              </Text>
              <Button 
                variant="outline" 
                color="blue"
                size={isMobile ? 'sm' : 'md'}
                rightIcon={<IconExternalLink size={16} />}
                component="a"
                href="https://ufmt.br/npj"
                target="_blank"
              >
                Conheça o NPJ
              </Button>
            </div>
          </SimpleGrid>
        </Container>
      </section>

      {/* Footer */}
      <footer style={{ background: '#001F3F', color: 'white', padding: isMobile ? '30px 0' : '50px 0 30px' }}>
        <Container size="xl">
          <SimpleGrid cols={4} spacing="xl" breakpoints={[{ maxWidth: 'lg', cols: 2 }, { maxWidth: 'sm', cols: 1 }]}>
            <div>
              <Title order={4} mb="md" c="white">
                Sistema NPJ
              </Title>
              <Text>Plataforma de gestão de processos do Núcleo de Práticas Jurídicas da UFMT.</Text>
            </div>
            <div>
              <Title order={4} mb="md" c="white">
                Links Úteis
              </Title>
              <Anchor href="/login" c="gray.3" display="block" py={5}>Acesso ao Sistema</Anchor>
              <Anchor href="#" c="gray.3" display="block" py={5}>Documentação</Anchor>
              <Anchor href="#" c="gray.3" display="block" py={5}>Suporte</Anchor>
            </div>
            <div>
              <Title order={4} mb="md" c="white">
                Contato
              </Title>
              <Text>Av. Fernando Corrêa da Costa, 2367</Text>
              <Text>Boa Esperança, Cuiabá - MT</Text>
              <Text>CEP: 78060-900</Text>
              <Text>npj@ufmt.br</Text>
              <Text>(65) 3615-8000</Text>
            </div>
            <div>
              <Title order={4} mb="md" c="white">
                Legal
              </Title>
              <Anchor href="#" c="gray.3" display="block" py={5}>Termos de Uso</Anchor>
              <Anchor href="#" c="gray.3" display="block" py={5}>Política de Privacidade</Anchor>
              <Anchor href="#" c="gray.3" display="block" py={5}>Acessibilidade</Anchor>
            </div>
          </SimpleGrid>
          
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 40, paddingTop: 20, textAlign: 'center' }}>
            <Text c="gray.5">
              © {new Date().getFullYear()} UFMT - NPJ. Todos os direitos reservados.
            </Text>
          </div>
        </Container>
      </footer>
    </>
  );
}

export default Home;