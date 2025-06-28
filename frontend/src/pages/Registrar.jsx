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
  Notification,
} from '@mantine/core';
import { useState } from 'react';
import axios from 'axios';
import classes from './AuthenticationTitle.module.css';

export function Registrar() {
  const [nome, setNome] = useState('');  // Adicionando o estado para o nome
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Handle form submission
  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        nome,  // Incluindo o nome no corpo da requisição
        email,
        password,
        role: 'usuario', // or 'admin' based on your requirement
      });

      if (response.status === 201) {
        // Handle successful registration (show success message)
        setError('Cadastro realizado com sucesso! Faça login.');
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      setError('Erro ao registrar usuário. Tente novamente.');
    }
  };

  return (
    <Container size="xs" my={40}>
      <Title ta="center" className={classes.title}>
        Sistema NPJ
      </Title>

      {/* Exibindo a notificação fora do formulário */}
      {error && (
        <Notification
          color={error === 'Cadastro realizado com sucesso! Faça login.' ? 'green' : 'red'}
          mt="md"
          onClose={() => setError('')}
        >
          {error}
        </Notification>
      )}

      <Paper withBorder shadow="md" p={30} mt={30} radius="md" style={{ width: 420 }}>
        <TextInput
          label="Nome"
          placeholder="Seu nome completo"
          value={nome}
          onChange={(e) => setNome(e.currentTarget.value)}
          required
        />
        <TextInput
          label="E-mail"
          placeholder="seu@email.dev"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          required
          mt="md"
        />
        <PasswordInput
          label="Senha"
          placeholder="Sua senha"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          required
          mt="md"
        />
        <PasswordInput
          label="Confirmar senha"
          placeholder="Repita sua senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}
          required
          mt="md"
        />
        <Button fullWidth mt="xl" onClick={handleRegister}>
          Registrar
        </Button>
      </Paper>
    </Container>
  );
}

export default Registrar;
