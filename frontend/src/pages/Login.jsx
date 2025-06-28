import {
  Anchor,
  Button,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  Stack,
  Notification,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import classes from './AuthenticationTitle.module.css';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        password:senha,
      });

      const { token, usuario } = response.data;

      // Armazene o token para uso futuro (ex: header de autenticação)
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      // Redireciona para a home
      navigate('/home');
    } catch (error) {
      console.error('Erro no login:', error);
      setErro('E-mail ou senha inválidos.');
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        Sistema NPJ
      </Title>

      <Text c="dimmed" size="sm" ta="center" mt="sm">
        Não tem uma conta?{' '}
        <Anchor size="sm" component="button" onClick={() => navigate('/registrar')}>
          Crie uma agora
        </Anchor>
      </Text>

      {erro && (
        <Notification color="red" mt="md" onClose={() => setErro('')}>
          {erro}
        </Notification>
      )}

      <Paper withBorder shadow="md" p={30} mt={30} radius="md" style={{ width: 420 }}>
        <Stack>
          <TextInput
            label="E-mail"
            placeholder="seu@email.dev"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
          />
          <PasswordInput
            label="Senha"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.currentTarget.value)}
            required
          />
        </Stack>

        <Group justify="space-between" mt="lg">
          <Anchor component="button" size="sm">
            Esqueceu a senha?
          </Anchor>
        </Group>

        <Button fullWidth mt="xl" onClick={handleLogin}>
          Login
        </Button>
      </Paper>
    </Container>
  );
}

export default Login;
