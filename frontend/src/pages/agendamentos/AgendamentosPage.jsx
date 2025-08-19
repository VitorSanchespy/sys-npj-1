import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { apiRequest } from '@/api/apiRequest';
import { useGlobalToast } from '@/contexts/ToastContext';
import AgendamentosLista from '@/components/agendamentos/AgendamentosLista';

const AgendamentosPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useAuthContext();
  const { showSuccess, showError } = useGlobalToast();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Função para buscar agendamentos
  const fetchAgendamentos = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiRequest('/api/agendamentos', {
        method: 'GET',
        token
      });
      
      if (response.success) {
        setAgendamentos(response.data || []);
      } else {
        throw new Error(response.message || 'Erro ao buscar agendamentos');
      }
    } catch (err) {
      console.error('❌ Erro ao buscar agendamentos:', err);
      setError(err.message || 'Erro ao buscar agendamentos');
      setAgendamentos([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar agendamentos na inicialização
  useEffect(() => {
    fetchAgendamentos();
  }, [token]);

  // Recarregar se necessário (após criação/edição)
  useEffect(() => {
    if (location.state?.reload) {
      fetchAgendamentos();
      // Limpar o estado para evitar recarregamento desnecessário
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Manipuladores de eventos
  const handleEdit = (agendamento) => {
    navigate(`/agendamentos/${agendamento.id}/editar`);
  };

  const handleDelete = async (agendamentoId) => {
    if (!window.confirm('Tem certeza que deseja deletar este agendamento?')) {
      return;
    }
    
    try {
      const response = await apiRequest(`/api/agendamentos/${agendamentoId}`, {
        method: 'DELETE',
        token
      });
      
      if (response.success) {
        showSuccess('Agendamento deletado com sucesso!');
        // Recarregar a lista
        fetchAgendamentos();
      } else {
        showError(response.message || 'Erro ao deletar agendamento');
      }
    } catch (err) {
      showError('Erro ao deletar agendamento: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const handleStatusChange = (agendamentoAtualizado) => {
    // Atualizar o agendamento na lista local
    setAgendamentos(prev =>
      Array.isArray(prev) ? prev.map(a =>
        a && a.id === agendamentoAtualizado?.id ? agendamentoAtualizado : a
      ).filter(a => a && typeof a.id !== 'undefined') : []
    );
  };

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '18px', color: '#666' }}>
          Carregando agendamentos...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div style={{
            color: '#dc3545',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '6px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            {error}
          </div>
          <button
            onClick={fetchAgendamentos}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Cabeçalho da página */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            margin: 0,
            color: '#1f2937'
          }}>
            Agendamentos
          </h1>
          <button
            onClick={() => navigate('/agendamentos/novo')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            <Plus size={20} />
            Novo Agendamento
          </button>
        </div>

        {/* Lista de agendamentos */}
        <AgendamentosLista
          agendamentos={Array.isArray(agendamentos) ? agendamentos.filter(a => a && typeof a.id !== 'undefined') : []}
          showCreateButton={false} // Já temos o botão no cabeçalho
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
};

export default AgendamentosPage;
