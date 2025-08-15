import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { apiRequest } from '@/api/apiRequest';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import Loader from '@/components/common/Loader';
import AgendamentoForm from './AgendamentoForm';
import { formatDate, formatDateTime } from '@/utils/commonUtils';

const AgendamentosLista = ({ processoId = null, showCreateButton = true }) => {
  const { token, user } = useAuthContext();
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
      console.error('Erro ao carregar agendamentos:', error);
      setError(error.message || 'Erro interno do servidor');
      setAgendamentos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (agendamento) => {
    setEditingAgendamento(agendamento);
    setShowForm(true);
  };

  const handleDelete = async (agendamento) => {
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
      console.error('Erro ao deletar agendamento:', error);
      alert(error.message || 'Erro ao deletar agendamento');
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
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '24px',
      border: '1px solid #e9ecef'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{ margin: 0, color: '#212529' }}>
          📅 {processoId ? 'Agendamentos do Processo' : 'Meus Agendamentos'}
        </h2>
        {showCreateButton && (
          <Button
            variant="primary"
            onClick={() => setShowForm(true)}
          >
            Novo Agendamento
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        border: '1px solid #e9ecef'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
            Tipo
          </label>
          <select
            name="tipo"
            value={filters.tipo}
            onChange={handleFilterChange}
            style={{
              width: '100%',
              padding: '6px 10px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">Todos os tipos</option>
            <option value="reuniao">Reunião</option>
            <option value="audiencia">Audiência</option>
            <option value="prazo">Prazo</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
            Status
          </label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            style={{
              width: '100%',
              padding: '6px 10px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
            Data Início
          </label>
          <input
            type="date"
            name="data_inicio"
            value={filters.data_inicio}
            onChange={handleFilterChange}
            style={{
              width: '100%',
              padding: '6px 10px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
            Data Fim
          </label>
          <input
            type="date"
            name="data_fim"
            value={filters.data_fim}
            onChange={handleFilterChange}
            style={{
              width: '100%',
              padding: '6px 10px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'end' }}>
          <Button
            variant="outline"
            onClick={clearFilters}
            style={{ fontSize: '14px', padding: '6px 12px' }}
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '16px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {agendamentos.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#6c757d'
        }}>
          <p style={{ margin: 0, fontSize: '16px' }}>
            {processoId 
              ? 'Nenhum agendamento encontrado para este processo.'
              : 'Você ainda não possui agendamentos.'
            }
          </p>
          {showCreateButton && (
            <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
              Clique em "Novo Agendamento" para criar seu primeiro agendamento.
            </p>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          {agendamentos.map(agendamento => (
            <div
              key={agendamento.id}
              style={{
                border: '1px solid #e9ecef',
                borderRadius: '6px',
                padding: '16px',
                backgroundColor: '#fff'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    color: '#212529',
                    fontSize: '18px',
                    fontWeight: '600'
                  }}>
                    {getTipoIcon(agendamento.tipo)} {agendamento.titulo}
                  </h3>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '3px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {getTipoText(agendamento.tipo)}
                    </span>
                    <StatusBadge status={getStatusText(agendamento.status)} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {canEdit(agendamento) && (
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(agendamento)}
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                    >
                      Editar
                    </Button>
                  )}
                  {canDelete(agendamento) && (
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(agendamento)}
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                    >
                      Deletar
                    </Button>
                  )}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div>
                  <strong style={{ fontSize: '14px' }}>📅 Data/Hora:</strong>
                  <p style={{ margin: '2px 0 0 0', fontSize: '14px', color: '#495057' }}>
                    {formatDateTime(agendamento.data_inicio)} até {formatDateTime(agendamento.data_fim)}
                  </p>
                </div>

                {agendamento.local && (
                  <div>
                    <strong style={{ fontSize: '14px' }}>📍 Local:</strong>
                    <p style={{ margin: '2px 0 0 0', fontSize: '14px', color: '#495057' }}>
                      {agendamento.local}
                    </p>
                  </div>
                )}

                {agendamento.processo && (
                  <div>
                    <strong style={{ fontSize: '14px' }}>📋 Processo:</strong>
                    <p style={{ margin: '2px 0 0 0', fontSize: '14px', color: '#495057' }}>
                      {agendamento.processo.numero_processo}
                    </p>
                  </div>
                )}

                <div>
                  <strong style={{ fontSize: '14px' }}>👤 Criado por:</strong>
                  <p style={{ margin: '2px 0 0 0', fontSize: '14px', color: '#495057' }}>
                    {agendamento.usuario?.nome || 'Usuário não identificado'}
                  </p>
                </div>
              </div>

              {agendamento.descricao && (
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ fontSize: '14px' }}>📝 Descrição:</strong>
                  <p style={{ margin: '2px 0 0 0', fontSize: '14px', color: '#495057' }}>
                    {agendamento.descricao}
                  </p>
                </div>
              )}

              {agendamento.convidados && agendamento.convidados.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ fontSize: '14px' }}>👥 Convidados ({agendamento.convidados.length}):</strong>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginTop: '4px'
                  }}>
                    {agendamento.convidados.map((convidado, index) => (
                      <span
                        key={index}
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          backgroundColor: convidado.status === 'aceito' ? '#d4edda' : 
                                         convidado.status === 'recusado' ? '#f8d7da' : '#fff3cd',
                          color: convidado.status === 'aceito' ? '#155724' : 
                                 convidado.status === 'recusado' ? '#721c24' : '#856404',
                          borderRadius: '3px',
                          fontSize: '12px',
                          border: '1px solid ' + (
                            convidado.status === 'aceito' ? '#c3e6cb' : 
                            convidado.status === 'recusado' ? '#f5c6cb' : '#ffeaa7'
                          )
                        }}
                      >
                        {convidado.nome || convidado.email} ({convidado.status})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {agendamento.observacoes && (
                <div>
                  <strong style={{ fontSize: '14px' }}>💬 Observações:</strong>
                  <p style={{ margin: '2px 0 0 0', fontSize: '14px', color: '#495057' }}>
                    {agendamento.observacoes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgendamentosLista;
