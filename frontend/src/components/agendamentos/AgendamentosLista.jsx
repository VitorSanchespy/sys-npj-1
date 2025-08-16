import React, { useState } from 'react';
import { useToast } from '@/components/common/Toast';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { apiRequest } from '@/api/apiRequest';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import Loader from '@/components/common/Loader';
import AgendamentoForm from './AgendamentoForm';
import { formatDate, formatDateTime } from '@/utils/commonUtils';

const AgendamentosLista = ({ agendamentos = [], showCreateButton = true, onEdit, onDelete, onStatusChange, onEnviarLembrete }) => {
  const { showSuccess, showError } = useToast();
  const { token, user } = useAuthContext();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState(null);

  // Removida lógica de busca/filtro interna. Agendamentos vêm via prop.

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
      // ...existing code...
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingAgendamento(null);
    // Atualização da lista deve ser feita pelo componente pai
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAgendamento(null);
  };

  // Removidos métodos de filtro, pois agora são responsabilidade do componente pai

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
        agendamento={editingAgendamento}
        isEditing={!!editingAgendamento}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {agendamentos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Você ainda não possui agendamentos.</p>
          {showCreateButton && (
            <p className="mt-2 text-sm">Clique em <span className="font-semibold text-primary-600">Novo</span> para criar seu primeiro agendamento.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {agendamentos.map(agendamento => (
            <div
              key={agendamento.id}
              className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 p-6 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{getTipoIcon(agendamento.tipo)}</span>
                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    className="text-lg font-bold bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 focus:outline-none truncate transition-colors"
                    onClick={() => navigate(`/agendamentos/${agendamento.id}`)}
                  >
                    {agendamento.titulo}
                  </button>
                  <div className="flex gap-2 mt-1">
                    <span className="bg-primary-50 text-primary-700 px-2 py-1 rounded-full text-xs font-semibold">{getTipoText(agendamento.tipo)}</span>
                    <StatusBadge status={getStatusText(agendamento.status)} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                  <span>Início: <span className="font-medium text-gray-800">{formatDateTime(agendamento.data_inicio)}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                  <span>Fim: <span className="font-medium text-gray-800">{formatDateTime(agendamento.data_fim)}</span></span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                  onClick={() => navigate(`/agendamentos/${agendamento.id}`)}
                >
                  Ver Detalhes
                </button>
                {canEdit(agendamento) && (
                  <button
                    className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
                    onClick={() => handleEdit(agendamento)}
                  >
                    Editar
                  </button>
                )}
                {canDelete(agendamento) && (
                  <button
                    className="px-4 py-2 bg-danger-600 text-white font-semibold rounded-lg hover:bg-danger-700 transition-colors"
                    onClick={() => handleDelete(agendamento)}
                  >
                    Excluir
                  </button>
                )}
                <button
                  className="px-4 py-2 bg-success-600 text-white font-semibold rounded-lg hover:bg-success-700 transition-colors"
                  onClick={async () => {
                    try {
                      const response = await apiRequest(`/api/agendamentos/${agendamento.id}/lembrete`, {
                        method: 'POST',
                        token
                      });
                      if (response.success) {
                        showSuccess(response.message || 'Lembrete enviado com sucesso!');
                      } else {
                        showError(response.message || 'Falha ao enviar lembrete.');
                      }
                    } catch (err) {
                      showError('Falha ao enviar lembrete: ' + (err.message || 'Erro desconhecido'));
                    }
                  }}
                >
                  Enviar Lembrete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgendamentosLista;
