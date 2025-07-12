import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Paper,
  Container,
  Group,
  Stack,
  Notification
} from '@mantine/core';
import { IconAt, IconUser, IconLock, IconArrowLeft, IconX } from '@tabler/icons-react';
import { validateEmail } from '@/utils/validators';

export function RegisterPage() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field, value) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const validateForm = () => {
    if (!form.nome.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    if (!validateEmail(form.email)) {
      setError('Email inválido');
      return false;
    }
    if (form.senha.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (form.senha !== form.confirmarSenha) {
      setError('As senhas não coincidem');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    
    const result = await register(form);
    
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <Container size="xs" py="xl">
      <Paper withBorder shadow="md" p="xl" radius="md">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={14} />}
          onClick={() => navigate('/')}
          mb="md"
        >
          Página inicial
        </Button>

        <Title order={2} ta="center" mb="xl">
          Criar nova conta
        </Title>

        {error && (
          <Notification 
            icon={<IconX size={18} />} 
            color="red"
            mb="md"
            onClose={() => setError(null)}
          >
            {error}
          </Notification>
        )}

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Nome Completo"
              placeholder="Seu nome"
              leftSection={<IconUser size={16} />}
              value={form.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              required
            />

            <TextInput
              label="Email"
              placeholder="seu@email.com"
              leftSection={<IconAt size={16} />}
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />

            <PasswordInput
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              leftSection={<IconLock size={16} />}
              value={form.senha}
              onChange={(e) => handleChange('senha', e.target.value)}
              required
            />

            <PasswordInput
              label="Confirmar Senha"
              placeholder="Digite novamente"
              leftSection={<IconLock size={16} />}
              value={form.confirmarSenha}
              onChange={(e) => handleChange('confirmarSenha', e.target.value)}
              required
            />

            <Button 
              type="submit" 
              fullWidth 
              loading={loading} 
              mt="md"
              style={{ backgroundColor: '#003366' }}
            >
              {loading ? 'Cadastrando...' : 'Criar conta'}
            </Button>
          </Stack>
        </form>

        <Group justify="center" mt="xl">
          <Text c="dimmed">
            Já tem uma conta?{' '}
            <Text component={Link} to="/login" c="#0066CC" fw={500} td="underline">
              Faça login
            </Text>
          </Text>
        </Group>
      </Paper>
    </Container>
  );
}
export default RegisterPage;
