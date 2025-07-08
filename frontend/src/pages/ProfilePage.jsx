import { useState, useEffect } from 'react';
import { Avatar, TextInput, Button, Group, Text, Paper } from '@mantine/core';
import { IconUser, IconMail, IconLock } from '@tabler/icons-react';
import { getUsers, updateUser } from '../services/api';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem('user')).id;
        const response = await getUsers();
        const userData = response.data.find(u => u.id === userId);
        setUser(userData);
        setFormData({
          nome: userData.nome,
          email: userData.email,
          senha: '',
          confirmarSenha: ''
        });
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        nome: formData.nome,
        email: formData.email
      };

      if (formData.senha) {
        updateData.senha = formData.senha;
      }

      await updateUser(user.id, updateData);
      // Atualizar dados locais e mostrar notificação
    } catch (error) {
      setError(error.response?.data?.erro || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Carregando...</div>;

  return (
    <Paper withBorder p="md">
      <Group mb="xl">
        <Avatar size="xl" radius="xl" />
        <div>
          <Text size="xl" weight={500}>{user.nome}</Text>
          <Text color="dimmed">{user.role}</Text>
        </div>
      </Group>

      <form onSubmit={handleSubmit}>
        <TextInput
          label="Nome"
          placeholder="Seu nome"
          icon={<IconUser size={14} />}
          value={formData.nome}
          onChange={(e) => setFormData({...formData, nome: e.target.value})}
          required
          mb="md"
        />

        <TextInput
          label="Email"
          placeholder="seu@email.com"
          icon={<IconMail size={14} />}
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
          mb="md"
        />

        <TextInput
          label="Nova Senha"
          placeholder="Deixe em branco para manter a atual"
          type="password"
          icon={<IconLock size={14} />}
          value={formData.senha}
          onChange={(e) => setFormData({...formData, senha: e.target.value})}
          mb="md"
        />

        <TextInput
          label="Confirmar Senha"
          placeholder="Confirme a nova senha"
          type="password"
          icon={<IconLock size={14} />}
          value={formData.confirmarSenha}
          onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})}
          mb="md"
        />

        {error && <Text color="red" mb="md">{error}</Text>}

        <Button type="submit" loading={loading}>
          Atualizar Perfil
        </Button>
      </form>
    </Paper>
  );
}