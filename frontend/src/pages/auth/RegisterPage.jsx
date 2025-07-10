import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextInput, PasswordInput, Button, Title, Text, Paper, Loader, Container, Group, Stack, Alert } from '@mantine/core';
import { IconAt, IconUser, IconLock, IconArrowLeft, IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react';
import api from '@/api/apiService';
import { validateEmail } from '@/utils/validators';

const DEFAULT_ROLE_ID = 2;

export function RegisterPage() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmarSenha: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const validateForm = () => {
    const newErrors = {};
    if (!form.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!validateEmail(form.email)) newErrors.email = 'Email inválido';
    if (form.senha.length < 6) newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    if (form.senha !== form.confirmarSenha) newErrors.confirmarSenha = 'As senhas não coincidem';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await api.post('/auth/register', { 
        ...form, 
        role_id: DEFAULT_ROLE_ID 
      });
      navigate('/login');
    } catch (error) {
      console.error('Erro no cadastro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xs" py="xl">
      <Paper withBorder shadow="md" p="xl" radius="md">
        <Button variant="subtle" leftSection={<IconArrowLeft size={14} />} onClick={() => navigate('/')} mb="md">
          Página inicial
        </Button>

        <Title order={2} ta="center" mb="xl">Criar nova conta</Title>

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Nome Completo"
              placeholder="Seu nome"
              leftSection={<IconUser size={16} />}
              value={form.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              error={errors.nome}
              required
            />

            <TextInput
              label="Email"
              placeholder="seu@email.com"
              leftSection={<IconAt size={16} />}
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              required
            />

            <PasswordInput
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              leftSection={<IconLock size={16} />}
              value={form.senha}
              onChange={(e) => handleChange('senha', e.target.value)}
              error={errors.senha}
              required
            />

            <PasswordInput
              label="Confirmar Senha"
              placeholder="Digite novamente"
              leftSection={<IconLock size={16} />}
              value={form.confirmarSenha}
              onChange={(e) => handleChange('confirmarSenha', e.target.value)}
              error={errors.confirmarSenha}
              required
            />

            {form.senha && form.confirmarSenha && form.senha !== form.confirmarSenha && (
              <Alert variant="light" color="red" icon={<IconAlertCircle />} mb="sm">
                As senhas não coincidem
              </Alert>
            )}

            <Button type="submit" fullWidth loading={loading} mt="md">
              {loading ? 'Cadastrando...' : 'Criar conta'}
            </Button>
          </Stack>
        </form>

        <Group justify="center" mt="xl">
          <Text c="dimmed">
            Já tem uma conta?{' '}
            <Text component={Link} to="/login" c="blue.5" fw={500} td="underline">
              Faça login
            </Text>
          </Text>
        </Group>
      </Paper>
    </Container>
  );
}
export default RegisterPage;