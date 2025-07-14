import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput, PasswordInput, Button, Title, Paper, Stack, Notification } from '@mantine/core';
import { IconAt, IconUser, IconLock, IconX } from '@tabler/icons-react';
import api from '@/api/apiService';

export function RegisterPage() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field, value) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.senha !== form.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/registrar', { nome: form.nome, email: form.email, senha: form.senha });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao registrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper withBorder p="xl" radius="md" style={{ minWidth: 340, margin: "0 auto" }}>
      <Title order={2} ta="center" mb="xl">
        Criar Conta
      </Title>
      {error && (
        <Notification icon={<IconX size={18} />} color="red" mb="md" onClose={() => setError(null)}>
          {error}
        </Notification>
      )}
      {success && (
        <Notification icon={<IconUser size={18} />} color="teal" mb="md">
          Conta criada com sucesso! Redirecionando...
        </Notification>
      )}
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Nome"
            placeholder="Seu nome"
            value={form.nome}
            onChange={e => handleChange("nome", e.target.value)}
            leftSection={<IconUser size={16} />}
            required
          />
          <TextInput
            label="Email"
            placeholder="seu@email.com"
            value={form.email}
            onChange={e => handleChange("email", e.target.value)}
            leftSection={<IconAt size={16} />}
            required
          />
          <PasswordInput
            label="Senha"
            placeholder="Escolha uma senha"
            value={form.senha}
            onChange={e => handleChange("senha", e.target.value)}
            leftSection={<IconLock size={16} />}
            required
          />
          <PasswordInput
            label="Confirmar Senha"
            placeholder="Digite novamente"
            value={form.confirmarSenha}
            onChange={e => handleChange("confirmarSenha", e.target.value)}
            leftSection={<IconLock size={16} />}
            required
          />
          <Button type="submit" loading={loading} fullWidth>
            Criar Conta
          </Button>
        </Stack>
      </form>
      <Button mt="lg" variant="subtle" fullWidth onClick={() => navigate('/login')}>
        Já tem conta? Faça login
      </Button>
    </Paper>
  );
}
export default RegisterPage;