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
  createStyles,
  Anchor
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
import Head from 'next/head';

const useStyles = createStyles((theme) => ({
  hero: {
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
  },
  featureCard: {
    borderTop: `4px solid ${theme.colors.blue[6]}`,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-10px)',
      boxShadow: theme.shadows.md
    }
  },
  footerLink: {
    transition: 'color 0.2s ease',
    '&:hover': {
      color: theme.colors.blue[3]
    }
  }
}));

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

export default function Home() {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const { width } = useViewportSize();
  const isMobile = width < theme.breakpoints.sm;

  return (
    <>
      <Head>
        <title>Sistema NPJ - UFMT | Gestão de Processos Jurídicos</title>
        <meta name="description" content="Plataforma de gestão de processos do Núcleo de Práticas Jurídicas da Universidade Federal de Mato Grosso" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

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

      {/* Hero Section */}
      <section className={classes.hero} style={{ padding: isMobile ? '60px 0' : '80px 0' }}>
        <Container size="xl">
          <SimpleGrid cols={2} spacing="xl" breakpoints={[{ maxWidth: 'md', cols: 1 }]}>
            <div>
              <Badge 
                variant="filled" 
                size="lg" 
                mb="md"
                sx={{ backgroundColor: theme.colors.blue[5] }}
              >
                Núcleo de Práticas Jurídicas
              </Badge>
              <Title 
                order={1} 
                style={{ 
                  lineHeight: 1.2, 
                  marginBottom: 20,
                  fontSize: isMobile ? '2rem' : '3rem'
                }}
              >
                Gestão Inteligente de Processos Jurídicos
              </Title>
              <Text size={isMobile ? 'md' : 'xl'} style={{ marginBottom: 30, maxWidth: 600 }}>
                Plataforma completa para gestão de processos, clientes e documentos do NPJ da Universidade Federal de Mato Grosso.
              </Text>
              <Group>
                <Button 
                  size={isMobile ? 'md' : 'lg'}
                  variant="light"
                  component="a"
                  href="/login"
                  sx={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
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
            )}
          </SimpleGrid>
        </Container>
      </section>

      {/* Features Section */}
      <section style={{ padding: isMobile ? '50px 0' : '80px 0' }}>
        <Container size="xl">
          <Title 
            order={2} 
            align="center" 
            mb="xl" 
            style={{ color: '#001F3F' }}
          >
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
                className={classes.featureCard}
              >
                <Center mb="md">
                  <div style={{ color: theme.colors.blue[6] }}>
                    {feature.icon}
                  </div>
                </Center>
                <Title 
                  order={4} 
                  align="center" 
                  mb="sm" 
                  style={{ color: '#001F3F' }}
                >
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
        backgroundColor: theme.colors.gray[0], 
        padding: isMobile ? '50px 0' : '80px 0',
        borderTop: `1px solid ${theme.colors.gray[2]}`,
        borderBottom: `1px solid ${theme.colors.gray[2]}`
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
              <Text size={isMobile ? 'md' : 'lg'} mb="md">
                O Núcleo de Práticas Jurídicas da Universidade Federal de Mato Grosso é um espaço de aprendizado 
                prático para estudantes de Direito, oferecendo assistência jurídica gratuita à comunidade.
              </Text>
              <Text size={isMobile ? 'md' : 'lg'} mb="xl">
                Este sistema foi desenvolvido para otimizar a gestão de processos, permitindo que estudantes e 
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
                Plataforma de gestão de processos do Núcleo de Práticas Jurídicas da Universidade Federal de Mato Grosso.
              </Text>
            </div>
            <div>
              <Title order={4} mb="md" style={{ color: 'white' }}>
                Links Úteis
              </Title>
              <Anchor href="/login" className={classes.footerLink} display="block" py={5}>Acesso ao Sistema</Anchor>
              <Anchor href="#" className={classes.footerLink} display="block" py={5}>Documentação</Anchor>
              <Anchor href="#" className={classes.footerLink} display="block" py={5}>Suporte</Anchor>
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
              <Anchor href="#" className={classes.footerLink} display="block" py={5}>Termos de Uso</Anchor>
              <Anchor href="#" className={classes.footerLink} display="block" py={5}>Política de Privacidade</Anchor>
              <Anchor href="#" className={classes.footerLink} display="block" py={5}>Acessibilidade</Anchor>
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