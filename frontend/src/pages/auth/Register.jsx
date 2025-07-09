import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Title, 
  Text, 
  Paper,
  Loader,
  Container,
  Group,
  Stack,
  Alert
} from '@mantine/core';
import { IconAt, IconUser, IconLock, IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';
import api from '@/api/apiService';
import { notifications } from '@mantine/notifications';
import { validateEmail } from '@/utils/validators';
import { IconCheck, IconX } from '@tabler/icons-react';

const DEFAULT_ROLE_ID = 2; // ID para usuário comum

export default function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!validateEmail(email)) newErrors.email = 'Email inválido';
    if (senha.length < 6) newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    if (senha !== confirmarSenha) newErrors.confirmarSenha = 'As senhas não coincidem';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await api.post('/auth/register', {
        nome: nome.trim(),
        email: email.trim(),
        senha,
        role_id: DEFAULT_ROLE_ID
      });

      notifications.show({
        title: 'Cadastro realizado!',
        message: 'Sua conta foi criada com sucesso',
        color: 'teal',
        icon: <IconCheck size={18} />,
      });
      
      navigate('/login');
      
    } catch (error) {
      const message = error.response?.data?.message || 
                     'Erro ao cadastrar. Tente novamente.';
      
      notifications.show({
        title: 'Erro no cadastro',
        message,
        color: 'red',
        icon: <IconX size={18} />,
      });
    } finally {
      setLoading(false);
    }
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

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Nome Completo"
              placeholder="Seu nome"
              leftSection={<IconUser size={16} />}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              error={errors.nome}
              onBlur={() => validateForm()}
            />

            <TextInput
              label="Email"
              placeholder="seu@email.com"
              leftSection={<IconAt size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              error={errors.email}
              onBlur={() => validateForm()}
            />

            <PasswordInput
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              leftSection={<IconLock size={16} />}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              error={errors.senha}
              onBlur={() => validateForm()}
            />

            <PasswordInput
              label="Confirmar Senha"
              placeholder="Digite novamente"
              leftSection={<IconLock size={16} />}
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              error={errors.confirmarSenha}
              onBlur={() => validateForm()}
            />

            {senha && confirmarSenha && senha !== confirmarSenha && (
              <Alert 
                variant="light" 
                color="red" 
                icon={<IconAlertCircle />}
                mb="sm"
              >
                As senhas não coincidem
              </Alert>
            )}

            <Button 
              type="submit" 
              fullWidth 
              loading={loading}
              leftSection={loading ? <Loader size="sm" /> : null}
              mt="md"
            >
              {loading ? 'Cadastrando...' : 'Criar conta'}
            </Button>
          </Stack>
        </form>

        <Group justify="center" mt="xl">
          <Text c="dimmed">
            Já tem uma conta?{' '}
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