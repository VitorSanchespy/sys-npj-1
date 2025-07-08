import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TextInput, 
  Button, 
  Title, 
  Paper,
  Loader,
  Anchor,
  Text
} from '@mantine/core';
import { IconAt, IconArrowLeft } from '@tabler/icons-react';
import api from '@/api/apiService';
import useNotification from '@/hooks/useNotification';
import { validateEmail } from '@/utils/validators';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      showNotification('Por favor, insira um email válido', 'error');
      return;
    }

    setLoading(true);
    
    try {
      await api.post('/auth/reset-password', { email: email.trim() });
      showNotification('Email de redefinição enviado com sucesso!', 'success');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || 
                     'Erro ao enviar email de redefinição. Tente novamente.';
      showNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Paper className="auth-form" withBorder shadow="md" p={30} radius="md">
        <Button
          variant="subtle"
          leftIcon={<IconArrowLeft size={14} />}
          onClick={() => navigate(-1)}
          mb="md"
          compact
        >
          Voltar
        </Button>

        <Title order={2} align="center" mb="xl">
          Redefinir Senha
        </Title>

        <Text align="center" mb="xl" c="dimmed">
          Digite seu email para receber o link de redefinição
        </Text>

        <form onSubmit={handleSubmit}>
          <TextInput
            name="email"
            label="Email"
            placeholder="seu@email.com"
            icon={<IconAt size={16} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            mb="xl"
          />

          <Button 
            type="submit" 
            fullWidth 
            loading={loading}
            leftIcon={loading ? <Loader size="sm" /> : null}
          >
            {loading ? 'Enviando...' : 'Enviar Link'}
          </Button>
        </form>

        <Text align="center" mt="md">
          Lembrou sua senha?{' '}
          <Anchor component={Link} to="/login">
            Faça login
          </Anchor>
        </Text>
      </Paper>

      <style jsx>{`
        .auth-container {
          display: flex;
          min-height: 100vh;
          align-items: center;
          justify-content: center;
          background-color: var(--mantine-color-gray-1);
        }
        .auth-form {
          width: 100%;
          max-width: 400px;
        }
      `}</style>
    </div>
  );
}