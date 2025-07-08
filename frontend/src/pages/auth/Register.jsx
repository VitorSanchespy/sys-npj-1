import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Title, 
  Text, 
  Paper,
  Loader
} from '@mantine/core';
import { IconAt, IconUser, IconLock, IconArrowLeft } from '@tabler/icons-react';
import api from '@/api/apiService';
import useNotification from '@/hooks/useNotification';
import { validateEmail, validatePassword } from '@/utils/validators';

const DEFAULT_ROLE_ID = 2; // ID para usuário comum

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações
    if (!validateEmail(formData.email)) {
      showNotification('Por favor, insira um email válido', 'error');
      return;
    }

    if (!validatePassword(formData.senha)) {
      showNotification('A senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      showNotification('As senhas não coincidem', 'error');
      return;
    }

    setLoading(true);
    
    try {
      await api.post('/auth/register', {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        senha: formData.senha,
        role_id: DEFAULT_ROLE_ID
      });

      showNotification('Cadastro realizado com sucesso!', 'success');
      navigate('/login');
      
    } catch (error) {
      const message = error.response?.data?.message || 
                     'Erro ao cadastrar. Tente novamente.';
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
          Criar Conta
        </Title>

        <form onSubmit={handleSubmit}>
          <TextInput
            name="nome"
            label="Nome Completo"
            placeholder="Seu nome"
            icon={<IconUser size={16} />}
            value={formData.nome}
            onChange={handleChange}
            required
            mb="md"
          />

          <TextInput
            name="email"
            label="Email"
            placeholder="seu@email.com"
            icon={<IconAt size={16} />}
            value={formData.email}
            onChange={handleChange}
            required
            mb="md"
          />

          <PasswordInput
            name="senha"
            label="Senha"
            placeholder="Mínimo 6 caracteres"
            icon={<IconLock size={16} />}
            value={formData.senha}
            onChange={handleChange}
            required
            mb="md"
          />

          <PasswordInput
            name="confirmarSenha"
            label="Confirmar Senha"
            placeholder="Digite novamente"
            icon={<IconLock size={16} />}
            value={formData.confirmarSenha}
            onChange={handleChange}
            required
            mb="xl"
          />

          <Button 
            type="submit" 
            fullWidth 
            loading={loading}
            leftIcon={loading ? <Loader size="sm" /> : null}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </form>

        <Text align="center" mt="md">
          Já tem uma conta?{' '}
          <Link to="/login" className="auth-link">
            Faça login
          </Link>
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
        .auth-link {
          color: var(--mantine-color-blue-5);
          text-decoration: none;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}