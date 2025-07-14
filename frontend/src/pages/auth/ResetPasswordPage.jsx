import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput, Button, Title, Paper, Text, Stack, Notification } from '@mantine/core';
import { IconAt, IconX, IconCheck } from '@tabler/icons-react';
import api from '@/api/apiService';

export function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/solicitar-recuperacao', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao solicitar redefinição.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Paper withBorder p="xl" radius="md">
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
    );
  }

  return (
    <Paper withBorder p="xl" radius="md" style={{ minWidth: 340, margin: "0 auto" }}>
      <Title order={2} ta="center" mb="xl">
        Redefinir Senha
      </Title>
      {error && (
        <Notification icon={<IconX size={18} />} color="red" mb="md" onClose={() => setError(null)}>
          {error}
        </Notification>
      )}
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Email"
            placeholder="seu@email.com"
            leftSection={<IconAt size={16} />}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Button type="submit" loading={loading} fullWidth>
            Enviar Link de Redefinição
          </Button>
        </Stack>
      </form>
      <Button mt="lg" variant="subtle" fullWidth onClick={() => navigate('/login')}>
        Voltar para login
      </Button>
    </Paper>
  );
}
export default ResetPasswordPage;