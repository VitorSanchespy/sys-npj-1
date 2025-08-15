import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { apiRequest } from '@/api/apiRequest';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import Loader from '@/components/common/Loader';
import AgendamentoForm from './AgendamentoForm';
import { formatDate, formatDateTime } from '@/utils/commonUtils';

const AgendamentosLista = ({ processoId = null, showCreateButton = true, onEdit, onDelete, onStatusChange, onEnviarLembrete }) => {
  const { token, user } = useAuthContext();
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState(null);
  const [filters, setFilters] = useState({
    tipo: '',
    status: '',
    data_inicio: '',
    data_fim: ''
  });

  useEffect(() => {
    carregarAgendamentos();
  }, [processoId, filters]);

  const carregarAgendamentos = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (processoId) params.append('processo_id', processoId);
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.status) params.append('status', filters.status);
      if (filters.data_inicio) params.append('data_inicio', filters.data_inicio);
      if (filters.data_fim) params.append('data_fim', filters.data_fim);

      const response = await apiRequest(`/api/agendamentos?${params.toString()}`, {
        method: 'GET',
        token
      });

      if (response.success) {
        setAgendamentos(response.data || []);
      } else {
        throw new Error(response.message || 'Erro ao carregar agendamentos');
      }
    } catch (error) {
  // console.error removido
      setError(error.message || 'Erro interno do servidor');
      setAgendamentos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (agendamento) => {
    if (onEdit) {
      onEdit(agendamento);
    } else {
      setEditingAgendamento(agendamento);
      setShowForm(true);
    }
  };

  const handleDelete = async (agendamento) => {
    if (onDelete) {
      onDelete(agendamento.id);
    } else {
      if (!window.confirm(`Tem certeza que deseja deletar o agendamento "${agendamento.titulo}"?`)) {
        return;
      }

      try {
        const response = await apiRequest(`/api/agendamentos/${agendamento.id}`, {
          method: 'DELETE',
          token
        });

        if (response.success) {
          await carregarAgendamentos();
        } else {
          throw new Error(response.message || 'Erro ao deletar agendamento');
        }
      } catch (error) {
  // console.error removido
        alert(error.message || 'Erro ao deletar agendamento');
      }
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingAgendamento(null);
    await carregarAgendamentos();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAgendamento(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      tipo: '',
      status: '',
      data_inicio: '',
      data_fim: ''
    });
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'reuniao': return '👥';
      case 'audiencia': return '⚖️';
      case 'prazo': return '⏰';
      default: return '📅';
    }
  };

  const getTipoText = (tipo) => {
    switch (tipo) {
      case 'reuniao': return 'Reunião';
      case 'audiencia': return 'Audiência';
      case 'prazo': return 'Prazo';
      default: return 'Outro';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'confirmado': return 'Confirmado';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const canEdit = (agendamento) => {
    return agendamento.criado_por === user?.id;
  };

  const canDelete = (agendamento) => {
    return agendamento.criado_por === user?.id;
  };

  if (showForm) {
    return (
      <AgendamentoForm
        processoId={processoId}
        agendamento={editingAgendamento}
        isEditing={!!editingAgendamento}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  if (loading) {
    return <Loader message="Carregando agendamentos..." />;
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
          {error}
        </div>
      )}
      {agendamentos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Você ainda não possui agendamentos.</p>
          {showCreateButton && (
            <p className="mt-2 text-sm">Clique em <span className="font-semibold text-blue-600">Novo</span> para criar seu primeiro agendamento.</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {agendamentos.map(agendamento => (
            <div
              key={agendamento.id}
              className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getTipoIcon(agendamento.tipo)}</span>
                  <button
                    type="button"
                    className="text-blue-700 font-semibold hover:underline focus:outline-none"
                    onClick={() => navigate(`/agendamentos/${agendamento.id}`)}
                  >
                    {agendamento.titulo}
                  </button>
                </div>
                <div className="flex gap-2">
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">{getTipoText(agendamento.tipo)}</span>
                  <StatusBadge status={getStatusText(agendamento.status)} />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-500">
                <span>Início: {formatDateTime(agendamento.data_inicio)}</span>
                <span>Fim: {formatDateTime(agendamento.data_fim)}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" onClick={() => navigate(`/agendamentos/${agendamento.id}`)}>
                  Ver Detalhes
                </Button>
                {canEdit(agendamento) && (
                  <Button variant="outline" onClick={() => handleEdit(agendamento)}>
                    Editar
                  </Button>
                )}
                {canDelete(agendamento) && (
                  <Button variant="danger" onClick={() => handleDelete(agendamento)}>
                    Excluir
                  </Button>
                )}
                <Button variant="outline" onClick={() => onEnviarLembrete?.(agendamento.id)}>
                  Enviar Lembrete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgendamentosLista;
