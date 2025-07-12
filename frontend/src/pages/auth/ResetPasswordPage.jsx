import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextInput,
  Button,
  Title,
  Paper,
  Text,
  Container,
  Group,
  Stack
} from '@mantine/core';
import {
  IconAt,
  IconArrowLeft,
  IconCheck
} from '@tabler/icons-react';
import api from '@/api/apiService';
import { validateEmail } from '@/utils/validators';
import { toast } from 'react-toastify';

export function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast.error('Por favor, insira um email válido');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email: email.trim() });
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao enviar email de redefinição.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container size="xs" py="xl">
        <Paper withBorder shadow="md" p="xl" radius="md">
          <Stack align="center" textAlign="center">
            <IconCheck size={48} color="var(--mantine-color-teal-6)" />
            <Title order={2} mb="sm">Email enviado com sucesso!</Title>
            <Text c="dimmed" mb="xl">
              Enviamos um link de redefinição para <strong>{email}</strong>.
            </Text>
            <Button variant="outline" onClick={() => navigate('/login')}>
              Voltar para login
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xs" py="xl">
      <Paper withBorder shadow="md" p="xl" radius="md">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={14} />}
          onClick={() => navigate('/login')}
          mb="md"
        >
          Voltar para login
        </Button>

        <Stack align="center" mb="md">
          <Title order={2} ta="center">Redefinir Senha</Title>
          <Text c="dimmed" ta="center">
            Digite seu email para receber o link de redefinição
          </Text>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="seu@email.com"
              leftSection={<IconAt size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" fullWidth loading={loading} mt="md">
              {loading ? 'Enviando...' : 'Enviar Link'}
            </Button>
          </Stack>
        </form>

        <Group justify="center" mt="xl">
          <Text c="dimmed">
            Lembrou sua senha?{' '}
            <Text component={Link} to="/login" c="blue.5" fw={500} td="underline">
              Faça login
            </Text>
          </Text>
        </Group>
      </Paper>
    </Container>
  );
}

export default ResetPasswordPage;
