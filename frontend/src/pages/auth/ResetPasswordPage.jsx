import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TextInput, 
  Button, 
  Title, 
  Paper,
  Loader,
  Text,
  Container,
  Group,
  Stack,
  Alert
} from '@mantine/core';
import { IconAt, IconArrowLeft, IconCheck } from '@tabler/icons-react';
import api from '@/api/apiService';
import { notifications } from '@mantine/notifications';
import { validateEmail } from '@/utils/validators';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(email)) {
      setError('Por favor, insira um email válido');
      return;
    }

    setLoading(true);
    
    try {
      await api.post('/auth/reset-password', { email: email.trim() });
      
      notifications.show({
        title: 'Email enviado!',
        message: 'Verifique sua caixa de entrada para redefinir sua senha',
        color: 'teal',
        icon: <IconCheck size={18} />,
      });
      
      setSuccess(true);
    } catch (err) {
      const message = err.response?.data?.message || 
                     'Erro ao enviar email de redefinição. Tente novamente.';
      setError(message);
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
            <Title order={2} mb="sm">
              Email enviado com sucesso!
            </Title>
            <Text c="dimmed" mb="xl">
              Enviamos um link de redefinição para <strong>{email}</strong>.
              Verifique sua caixa de entrada.
            </Text>
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
            >
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
          <Title order={2} ta="center">
            Redefinir Senha
          </Title>
          <Text c="dimmed" ta="center">
            Digite seu email para receber o link de redefinição
          </Text>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack>
            {error && (
              <Alert 
                variant="light" 
                color="red" 
                mb="sm"
              >
                {error}
              </Alert>
            )}

            <TextInput
              label="Email"
              placeholder="seu@email.com"
              leftSection={<IconAt size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              error={!validateEmail(email) && email.length > 0}
              onBlur={() => {
                if (email.length > 0 && !validateEmail(email)) {
                  setError('Por favor, insira um email válido');
                }
              }}
            />

            <Button 
              type="submit" 
              fullWidth 
              loading={loading}
              leftSection={loading ? <Loader size="sm" /> : null}
              mt="md"
            >
              {loading ? 'Enviando...' : 'Enviar Link'}
            </Button>
          </Stack>
        </form>

        <Group justify="center" mt="xl">
          <Text c="dimmed">
            Lembrou sua senha?{' '}
            <Text 
              component={Link} 
              to="/login" 
              c="blue.5" 
              fw={500}
              td="underline"
            >
              Faça login
            </Text>
          </Text>
        </Group>
      </Paper>
    </Container>
  );
}