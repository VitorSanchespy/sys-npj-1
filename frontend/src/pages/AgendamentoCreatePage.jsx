import React, { useEffect, useState } from 'react';
import AgendamentoForm from '../components/agendamentos/AgendamentoForm';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { apiRequest } from '@/api/apiRequest';

const AgendamentoCreatePage = () => {
  const navigate = useNavigate();
  const { token, user } = useAuthContext();
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProcessos = async () => {
      setLoading(true);
      setError('');
      try {
        // Buscar processos vinculados ao usuário logado e não concluídos
        const response = await apiRequest(`/api/processos/usuario?concluidos=false`, {
          method: 'GET',
          token
        });
        if (response.success) {
          setProcessos(response.data || []);
        } else {
          throw new Error(response.message || 'Erro ao buscar processos');
        }
      } catch (err) {
        setError(err.message || 'Erro ao buscar processos');
        setProcessos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProcessos();
  }, [token]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => navigate('/agendamentos')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'transparent',
            border: '1px solid #ccc',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#666',
            marginRight: '16px'
          }}
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Novo Agendamento</h1>
      </div>
      {error && (
        <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>
      )}
      <AgendamentoForm
        processos={processos}
        onSuccess={() => navigate('/agendamentos', { state: { reload: true } })}
        onCancel={() => navigate('/agendamentos')}
      />
    </div>
  );
};

export default AgendamentoCreatePage;
