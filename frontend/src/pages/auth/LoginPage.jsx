import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TextInput, PasswordInput, Button, Title, Text, Paper, Image 
} from '@mantine/core';
import { IconAt, IconLock } from '@tabler/icons-react';
import api from '@/api/apiService';
import { useNotification } from '@/contexts/NotificationContext';
import { validateEmail } from '@/utils/validators';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(credentials.email)) {
      showNotification('Por favor, insira um email válido', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const { data } = await api.post('/auth/login', {
        email: credentials.email.trim(),
        password: credentials.password
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      
      showNotification('Login realizado com sucesso!', 'success');
      navigate('/dashboard');
      
    } catch (error) {
      const message = error.response?.data?.message || 
                    'Erro ao realizar login. Tente novamente.';
      showNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Paper className="login-form" withBorder shadow="md" p={30} radius="md">
        <div className="login-header">
          <Image 
            src="/ufmt-logo.png" 
            alt="UFMT Logo" 
            width={120}
            mx="auto"
          />
          <Title order={3} mt="sm" mb="md">
            Sistema NPJ - Login
          </Title>
        </div>

        <form onSubmit={handleSubmit}>
          <TextInput
            name="email"
            label="Email"
            placeholder="seu@email.com"
            leftSection={<IconAt size={16} />}
            value={credentials.email}
            onChange={handleChange}
            required
            mb="md"
          />
          
          <PasswordInput
            name="password"
            label="Senha"
            placeholder="Sua senha"
            leftSection={<IconLock size={16} />}
            value={credentials.password}
            onChange={handleChange}
            required
            mb="md"
          />
          
          <Button
            type="submit"
            fullWidth
            loading={loading}
            leftSection={loading ? null : <IconLock size={16} />}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Paper>

      <style jsx="true">{`
        .login-container {
          display: flex;
          min-height: 100vh;
          align-items: center;
          justify-content: center;
          background-color: var(--mantine-color-gray-1);
        }
        .login-form {
          width: 100%;
          max-width: 400px;
        }
        .login-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  );
}