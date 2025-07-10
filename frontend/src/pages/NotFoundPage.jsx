import { Helmet } from 'react-helmet';
import { Container, Title, Text, Button, Group, Image, Center } from '@mantine/core';
import { IconHome, IconLock } from '@tabler/icons-react';
import { useViewportSize } from '@mantine/hooks';

export function NotFoundPage() {
  const { width } = useViewportSize();
  const isMobile = width < 768;

  return (
    <>
      <Helmet>
        <title>Página não encontrada | Sistema NPJ - UFMT</title>
        <meta name="description" content="Página não encontrada - Plataforma de gestão de processos do Núcleo de Práticas Jurídicas" />
      </Helmet>
{/* Header */}
      <header style={{ background: '#001F3F', padding: '20px 0', position: 'sticky', top: 0, zIndex: 100 }}>
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

      {/* 404 Content */}
      <section style={{ background: 'linear-gradient(135deg, #001F3F 0%, #003366 100%)', padding: '80px 0' }}>
        <Container size="xl">
          <Center style={{ height: '60vh', textAlign: 'center' }}>
            <div>
              <Title order={1} size="4rem" mb="md" c="white">
                404
              </Title>
              <Title order={2} size="2rem" mb="xl" c="white">
                Página não encontrada
              </Title>
              <Text size="xl" mb="xl" c="white" maw={600} mx="auto">
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

      {/* Footer */}
      <footer style={{ background: '#001F3F', color: 'white', padding: '50px 0 30px' }}>
        <Container size="xl">
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

export default NotFoundPage;