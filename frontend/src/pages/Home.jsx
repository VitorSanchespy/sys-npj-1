import { Container, Title, Text, Image, Stack } from '@mantine/core';

function Home() {
  console.log("Home component loaded!");

  return (
    <Container size="md" py={40}>
      <Stack spacing="xl" align="center">
        <Title order={1} ta="center">Sistema NPJ - UFMT</Title>

        <Text size="lg" c="dimmed" ta="center">
          Bem-vindo ao sistema de gerenciamento do Núcleo de Práticas Jurídicas da Universidade Federal de Mato Grosso.
        </Text>

        <Text size="sm" c="gray" ta="center">
          Acesse seus processos, cadastre atividades e acompanhe o desempenho acadêmico e profissional dos alunos estagiários.
        </Text>

        <Image
          src="/images/login_bg.jpeg"
          alt="Universidade Federal de Mato Grosso"
          radius="md"
          fallbackSrc="https://ufmt.br/assets/images/logo_rodape.png"
          maw={500}
          mx="auto"
          withPlaceholder
        />
      </Stack>
    </Container>
  );
}

export default Home;
