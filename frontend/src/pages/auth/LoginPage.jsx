import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput, PasswordInput, Button, Title, Text, Paper, Image } from '@mantine/core';
import { IconAt, IconLock } from '@tabler/icons-react';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Corrigindo o formato dos dados enviados
      const response = await axios.post('localhost:3001/auth/login', {
        email: email.trim(), // Remove espaços extras
        password: password    // Mantém a senha como está
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // 2. Verificando a estrutura da resposta
      if (response.data.token && response.data.usuario) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.usuario));
        navigate('/dashboard');
      } else {
        throw new Error('Resposta inesperada do servidor');
      }
      
    } catch (err) {
      // 3. Melhor tratamento de erros
      if (err.response) {
        // Erro 400-500 do servidor
        setError(err.response.data.erro || 'Credenciais inválidas');
      } else if (err.request) {
        // Falha na requisição (sem resposta)
        setError('Servidor não respondeu');
      } else {
        // Outros erros
        setError('Erro ao fazer login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Paper withBorder shadow="md" p={30} radius="md" w={400}>
        <div className="text-center mb-6">
          <Image 
            src="/ufmt-logo.png" 
            alt="UFMT Logo" 
            width={120}
            mx="auto"
            fallbackSrc="/placeholder-image.png"
          />
          <Title order={3} mt="sm">Sistema NPJ - Login</Title>
        </div>
        
        {error && (
          <Text color="red" size="sm" mb="md" align="center">
            {error}
          </Text>
        )}

        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            placeholder="seu@email.com"
            icon={<IconAt size={16} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            mb="md"
          />
          <PasswordInput
            label="Senha"
            placeholder="Sua senha"
            icon={<IconLock size={16} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            mb="md"
          />
          <Button
            type="submit"
            fullWidth
            loading={loading}
          >
            Entrar
          </Button>
        </form>
      </Paper>
    </div>
  );
}