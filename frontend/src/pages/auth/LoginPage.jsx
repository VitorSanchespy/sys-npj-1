import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TextInput, PasswordInput, Button, Title, Paper, Image, Container
} from '@mantine/core';
import { IconAt, IconLock } from '@tabler/icons-react';
import api from '@/api/apiService';
import { validateEmail } from '@/utils/validators';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error('Por favor, insira um email válido');
      return;
    }

    setLoading(true);
    
    try {
      const { data } = await api.post('/auth/login', {
        email: email.trim(),
        password
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
      
    } catch (error) {
      const message = error.response?.data?.message || 
                    'Erro ao realizar login. Tente novamente.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xs" py={40}>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Image 
          src="/ufmt-logo.png" 
          alt="UFMT Logo" 
          width={120}
          mx="auto"
          mb="md"
        />
        <Title order={3} ta="center" mb="md">
          Sistema NPJ - Login
        </Title>

        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            placeholder="seu@email.com"
            leftSection={<IconAt size={16} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            mb="md"
          />
          
          <PasswordInput
            label="Senha"
            placeholder="Sua senha"
            leftSection={<IconLock size={16} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            mb="md"
          />
          
          <Button
            type="submit"
            fullWidth
            loading={loading}
            leftSection={<IconLock size={16} />}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}