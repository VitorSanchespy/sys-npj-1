import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Center,
  Card,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Group,
  Stack,
  Anchor,
  Notification,
  Loader
} from '@mantine/core';
import { IconLock, IconAt, IconSchool, IconX } from '@tabler/icons-react';
import { validateEmail } from '@/utils/validators';
import SafeText from '@/components/ui/SafeText';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ email: '', senha: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateEmail(credentials.email)) {
      setError('Por favor, insira um email válido');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await login(credentials);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Credenciais inválidas');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e6f0ff, #f8f9fa)' }}>
      <Card shadow="md" padding="xl" radius="md" style={{
        width: '100%',
        maxWidth: 400,
        borderTop: '4px solid #003366',
        background: 'white'
      }}>
        <Stack align="center" mb="xl">
          <IconSchool size={48} color="#003366" />
          <Title order={2} style={{ color: '#003366', fontFamily: 'Georgia, serif' }}>
            <SafeText>Sistema NPJ - UFMT</SafeText>
          </Title>
          <Text c="dimmed">Acesso ao sistema de gestão jurídica</Text>
        </Stack>

        {error && (
          <Notification
            icon={<IconX size={18} />}
            color="red"
            mb="md"
            onClose={() => setError(null)}
            withCloseButton
          >
            {error}
          </Notification>
        )}

        <form onSubmit={handleLogin}>
          <Stack>
            <TextInput
              label="Email institucional"
              placeholder="seu.email@ufmt.br"
              leftSection={<IconAt size={16} />}
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              required
              size="md"
              autoFocus
            />

            <PasswordInput
              label="Senha"
              placeholder="Sua senha"
              leftSection={<IconLock size={16} />}
              value={credentials.senha}
              onChange={(e) => setCredentials({ ...credentials, senha: e.target.value })}
              required
              size="md"
            />

            <Group justify="flex-end" mt="sm">
              <Anchor component={Link} to="/reset-password" size="sm" c="#0066CC">
                Esqueceu a senha?
              </Anchor>
            </Group>

            <Button
              type="submit"
              fullWidth
              mt="xl"
              size="md"
              loading={loading}
              style={{ backgroundColor: '#003366' }}
            >
              {loading ? <Loader size="xs" color="white" /> : 'Entrar no Sistema'}
            </Button>
          </Stack>
        </form>

        <Group justify="center" mt="xl" pt="md" style={{ borderTop: '1px solid #e9ecef' }}>
          <Text c="dimmed">
            Não tem uma conta?{' '}
            <Anchor component={Link} to="/register" c="#0066CC" fw={500}>
              Cadastre-se
            </Anchor>
          </Text>
        </Group>

        <Box mt="xl" p="md" style={{ backgroundColor: '#f8f9fa', borderRadius: 8 }}>
          <SafeText size="sm" ta="center" c="dimmed">
            Universidade Federal de Mato Grosso • Núcleo de Práticas Jurídicas
          </SafeText>
        </Box>
      </Card>
    </Center>
  );
}