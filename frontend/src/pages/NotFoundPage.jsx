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
  useMantineTheme,
  Anchor,
  rem
} from '@mantine/core';
import { 
  IconScale, 
  IconFileDescription, 
  IconUsers, 
  IconBuilding, 
  IconCalendar, 
  IconLock,
  IconPhone,
  IconMapPin,
  IconMail,
  IconExternalLink
} from '@tabler/icons-react';
import { useViewportSize } from '@mantine/hooks';
import { Helmet } from 'react-helmet';

// Estilos usando a nova API do Mantine v7+
const useStyles = {
  hero: (theme) => ({
    background: 'linear-gradient(135deg, #001F3F 0%, #003366 100%)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: 'url("/pattern.svg")',
      backgroundSize: '500px',
      opacity: 0.05,
      pointerEvents: 'none'
    }
  }),
  featureCard: (theme) => ({
    borderTop: `${rem(4)} solid ${theme.colors.blue[6]}`,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-10px)',
      boxShadow: theme.shadows.md
    }
  }),
  footerLink: (theme) => ({
    transition: 'color 0.2s ease',
    '&:hover': {
      color: theme.colors.blue[3]
    }
  })
};

const features = [
  {
    icon: <IconScale size={36} />,
    title: "Gestão de Processos",
    description: "Controle completo de todos os processos jurídicos em andamento."
  },
  {
    icon: <IconFileDescription size={36} />,
    title: "Documentação Digital",
    description: "Armazene e acesse todos os documentos relacionados aos processos."
  },
  {
    icon: <IconUsers size={36} />,
    title: "Gestão de Clientes",
    description: "Cadastro e acompanhamento de clientes e partes envolvidas."
  },
  {
    icon: <IconCalendar size={36} />,
    title: "Controle de Prazos",
    description: "Alertas automáticos para prazos processuais importantes."
  }
];

export function NotFoundPage() {
  const theme = useMantineTheme();
  const { width } = useViewportSize();
  const isMobile = width < theme.breakpoints.sm;

  // Aplicando os estilos
  const heroStyle = useStyles.hero(theme);
  const featureCardStyle = useStyles.featureCard(theme);
  const footerLinkStyle = useStyles.footerLink(theme);

  return (
    <>
      <Helmet>
        <title>Página não encontrada | Sistema NPJ - UFMT</title>
        <meta name="description" content="Página não encontrada - Plataforma de gestão de processos do Núcleo de Práticas Jurídicas" />
      </Helmet>

      {/* Header */}
      <header style={{ 
        backgroundColor: '#001F3F', 
        padding: '20px 0',
        boxShadow: theme.shadows.sm,
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <Container size="xl">
          <Group position="apart">
            <Group spacing="xs">
              <Image 
                src="/ufmt-logo-white.png" 
                alt="UFMT Logo" 
                width={isMobile ? 40 : 60}
                withPlaceholder
              />
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

      {/* Página 404 Personalizada */}
      <section style={heroStyle}>
        <Container size="xl" py="xl">
          <Center style={{ height: '60vh', textAlign: 'center' }}>
            <div>
              <Title order={1} size={rem(72)} mb="md" style={{ color: 'white' }}>
                404
              </Title>
              <Title order={2} size={rem(32)} mb="xl" style={{ color: 'white' }}>
                Página não encontrada
              </Title>
              <Text size="xl" mb="xl" style={{ color: 'white', maxWidth: rem(600), margin: '0 auto' }}>
                A página que você está procurando não existe ou foi movida.
              </Text>
              <Group position="center">
                <Button 
                  size="lg" 
                  component="a"
                  href="/"
                  leftIcon={<IconHome size={20} />}
                >
                  Voltar à página inicial
                </Button>
              </Group>
            </div>
          </Center>
        </Container>
      </section>

      {/* Features Section (opcional - pode remover se quiser simplificar) */}
      <section style={{ padding: isMobile ? '50px 0' : '80px 0' }}>
        <Container size="xl">
          <Title order={2} align="center" mb="xl" style={{ color: '#001F3F' }}>
            Funcionalidades do Sistema
          </Title>
          
          <SimpleGrid 
            cols={4} 
            spacing="xl" 
            breakpoints={[
              { maxWidth: 'lg', cols: 2, spacing: 'md' },
              { maxWidth: 'sm', cols: 1, spacing: 'sm' }
            ]}
          >
            {features.map((feature, index) => (
              <Card 
                key={index} 
                shadow="sm" 
                padding="lg" 
                radius="md" 
                withBorder
                style={featureCardStyle}
              >
                <Center mb="md">
                  <div style={{ color: theme.colors.blue[6] }}>
                    {feature.icon}
                  </div>
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

      {/* Footer */}
      <footer style={{ 
        backgroundColor: '#001F3F', 
        color: 'white',
        padding: isMobile ? '30px 0' : '50px 0 30px'
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
                Plataforma de gestão de processos do Núcleo de Práticas Jurídicas da UFMT.
              </Text>
            </div>
            <div>
              <Title order={4} mb="md" style={{ color: 'white' }}>
                Links Úteis
              </Title>
              <Anchor href="/login" style={footerLinkStyle} display="block" py={5}>
                Acesso ao Sistema
              </Anchor>
              <Anchor href="#" style={footerLinkStyle} display="block" py={5}>
                Documentação
              </Anchor>
              <Anchor href="#" style={footerLinkStyle} display="block" py={5}>
                Suporte
              </Anchor>
            </div>
            <div>
              <Title order={4} mb="md" style={{ color: 'white' }}>
                Contato
              </Title>
              <Group spacing="xs" mb={4}>
                <IconMapPin size={16} />
                <Text>Av. Fernando Corrêa da Costa, 2367</Text>
              </Group>
              <Text ml={28} mb={4}>Boa Esperança, Cuiabá - MT</Text>
              <Text ml={28} mb={4}>CEP: 78060-900</Text>
              <Group spacing="xs">
                <IconMail size={16} />
                <Text>npj@ufmt.br</Text>
              </Group>
              <Group spacing="xs" mt={4}>
                <IconPhone size={16} />
                <Text>(65) 3615-8000</Text>
              </Group>
            </div>
            <div>
              <Title order={4} mb="md" style={{ color: 'white' }}>
                Legal
              </Title>
              <Anchor href="#" style={footerLinkStyle} display="block" py={5}>
                Termos de Uso
              </Anchor>
              <Anchor href="#" style={footerLinkStyle} display="block" py={5}>
                Política de Privacidade
              </Anchor>
              <Anchor href="#" style={footerLinkStyle} display="block" py={5}>
                Acessibilidade
              </Anchor>
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
    </>
  );
}
export default NotFoundPage;