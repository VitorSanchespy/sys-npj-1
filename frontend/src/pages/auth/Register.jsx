import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput, PasswordInput, Button, Title, Text, Paper } from '@mantine/core';
import { IconAt, IconUser, IconLock } from '@tabler/icons-react';
import { register } from '../../services/api';
import useNotification from '../../hooks/useNotification';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirmarSenha) {
      showNotification('As senhas não coincidem', 'error');
      return;
    }

    setLoading(true);
    try {
      await register({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        role_id: 2 // ID padrão para usuário comum
      });
      showNotification('Cadastro realizado com sucesso!');
      navigate('/login');
    } catch (error) {
      showNotification(error.response?.data?.erro || 'Erro ao cadastrar', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Paper withBorder shadow="md" p={30} radius="md" w={400}>
        <Title order={2} align="center" mb="xl">
          Criar Conta
        </Title>
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Nome Completo"
            placeholder="Seu nome"
            icon={<IconUser size={16} />}
            value={formData.nome}
            onChange={(e) => setFormData({...formData, nome: e.target.value})}
            required
            mb="md"
          />
          <TextInput
            label="Email"
            placeholder="seu@email.com"
            icon={<IconAt size={16} />}
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            mb="md"
          />
          <PasswordInput
            label="Senha"
            placeholder="Sua senha"
            icon={<IconLock size={16} />}
            value={formData.senha}
            onChange={(e) => setFormData({...formData, senha: e.target.value})}
            required
            mb="md"
          />
          <PasswordInput
            label="Confirmar Senha"
            placeholder="Confirme sua senha"
            icon={<IconLock size={16} />}
            value={formData.confirmarSenha}
            onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})}
            required
            mb="xl"
          />
          <Button type="submit" fullWidth loading={loading}>
            Cadastrar
          </Button>
        </form>
        <Text align="center" mt="md">
          Já tem uma conta? <a href="/login" className="text-blue-500">Faça login</a>
        </Text>
      </Paper>
    </div>
  );
}