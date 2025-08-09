import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/apiRequest';
import { useAuthContext } from '@/contexts/AuthContext';
import { useQueryClient } from "@tanstack/react-query";
import { getUserRole } from "../hooks/useApi";
import { requestCache } from "../utils/requestCache";
import GoogleCalendarConnect from './GoogleCalendarConnect';

const AgendamentoManager = ({ processoId = null }) => {
  const { user, token } = useAuthContext();
  const queryClient = useQueryClient();
  const userRole = getUserRole(user);
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    tipo_evento: '',
    status: '',
    data_inicio: '',
    data_fim: ''
  });

  // Helper function to safely get role name
  const getRoleName = (role) => {
    if (!role) return 'Usuário';
    if (typeof role === 'string') return role;
    if (typeof role === 'object' && role.nome) return role.nome;
    if (typeof role === 'object' && role.name) return role.name;
    return 'Usuário';
  };

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_evento: '',
    tipo_evento: 'reuniao',
    processo_id: processoId || '',
    usuario_id: '',
    local: '',
    lembrete_1_dia: true,
    lembrete_2_dias: true,
    lembrete_1_semana: false,
    status: 'agendado'
  });

  const [usuarios, setUsuarios] = useState([]);

  const tiposEvento = [
    { value: 'audiencia', label: 'Audiência' },
    { value: 'prazo', label: 'Prazo' },
    { value: 'reuniao', label: 'Reunião' },
    { value: 'diligencia', label: 'Diligência' },
    { value: 'outro', label: 'Outro' }
  ];

  const statusOptions = [
    { value: 'agendado', label: 'Agendado' },
    { value: 'realizado', label: 'Realizado' },
    { value: 'cancelado', label: 'Cancelado' },
    { value: 'adiado', label: 'Adiado' }
  ];

  useEffect(() => {
    carregarAgendamentos();
    carregarUsuarios();
  }, [processoId, user, token]);

  useEffect(() => {
    carregarAgendamentos();
  }, [filtros]);

  const carregarUsuarios = async () => {
    if (!user || !token) return;
    if (userRole === 'Aluno') return;
    try {
      const response = await apiRequest('/api/usuarios', {
        method: 'GET',
        token: token
      });
      console.log('Usuários carregados:', response);
      setUsuarios(Array.isArray(response) ? response : (response.data || []));
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const carregarAgendamentos = async () => {
    if (!user || !token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('/api/agendamentos', {
        method: 'GET',
        token: token
      });
      setAgendamentos(Array.isArray(response) ? response : (response.data || []));
    } catch (error) {
      setError('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (agendamento) => {
    setFormData({
      ...agendamento,
      data_evento: new Date(agendamento.data_evento).toISOString().slice(0, 16)
    });
    setEditando(agendamento.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!user || !token) return;
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        await apiRequest(`/api/agendamentos/${id}`, { 
          method: 'DELETE',
          token: token
        });
        
        // Atualização automática via React Query
        requestCache.clear();
        await queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
        await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      } catch (error) {
        console.error('Erro ao excluir agendamento:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      data_evento: '',
      tipo_evento: 'reuniao',
      processo_id: processoId || '',
      usuario_id: '',
      local: '',
      lembrete_1_dia: true,
      lembrete_2_dias: true,
      lembrete_1_semana: false,
      status: 'agendado'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !token) return;
    
    try {
      setLoading(true);
      setError(null);

      const dadosEnvio = {
        ...formData,
        usuario_id: formData.usuario_id || user.id,
        data_evento: new Date(formData.data_evento).toISOString()
      };

      console.log('📤 Dados sendo enviados:', dadosEnvio);
      console.log('👤 Usuário atual:', user);

      if (editando) {
        // Editar agendamento existente
        await apiRequest(`/api/agendamentos/${editando}`, {
          method: 'PUT',
          token: token,
          body: dadosEnvio
        });
      } else {
        // Criar novo agendamento
        await apiRequest('/api/agendamentos', {
          method: 'POST',
          token: token,
          body: dadosEnvio
        });
      }

      // Fechar o modal e recarregar a lista
      setShowForm(false);
      setEditando(null);
      resetForm();
      
      // Atualização automática via React Query
      requestCache.clear();
      await queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      setError(error.message || 'Erro ao salvar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const cores = {
      'agendado': 'bg-blue-100 text-blue-800',
      'realizado': 'bg-green-100 text-green-800',
      'cancelado': 'bg-red-100 text-red-800',
      'adiado': 'bg-yellow-100 text-yellow-800'
    };
    return cores[status] || 'bg-gray-100 text-gray-800';
  };

  const getTipoColor = (tipo) => {
    const cores = {
      'audiencia': 'bg-purple-100 text-purple-800',
      'prazo': 'bg-orange-100 text-orange-800',
      'reuniao': 'bg-blue-100 text-blue-800',
      'diligencia': 'bg-teal-100 text-teal-800',
      'outro': 'bg-gray-100 text-gray-800'
    };
    return cores[tipo] || 'bg-gray-100 text-gray-800';
  };

  const getTipoEventoColor = (tipo) => {
    const cores = {
      'audiencia': 'bg-purple-100 text-purple-800',
      'prazo': 'bg-orange-100 text-orange-800',
      'reuniao': 'bg-green-100 text-green-800',
      'diligencia': 'bg-cyan-100 text-cyan-800',
      'outro': 'bg-gray-100 text-gray-800'
    };
    return cores[tipo] || 'bg-gray-100 text-gray-800';
  };

  const getTipoEventoLabel = (tipo) => {
    const labels = {
      'audiencia': 'Audiência',
      'prazo': 'Prazo',
      'reuniao': 'Reunião',
      'diligencia': 'Diligência',
      'outro': 'Outro'
    };
    return labels[tipo] || tipo;
  };

  const getStatusLabel = (status) => {
    const labels = {
      'agendado': 'Agendado',
      'realizado': 'Realizado',
      'cancelado': 'Cancelado',
      'adiado': 'Adiado'
    };
    return labels[status] || status;
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNovoAgendamento = () => {
    if (!user || !token) {
      setError('Você precisa estar autenticado para criar um agendamento');
      return;
    }
    setError(null);
    setShowForm(true);
    setEditando(null);
    resetForm();
  };

  // Filtragem dos agendamentos
  const filteredAgendamentos = agendamentos.filter(agendamento => {
    // Filtro por tipo de evento
    if (filtros.tipo_evento && agendamento.tipo_evento !== filtros.tipo_evento) {
      return false;
    }
    
    // Filtro por status
    if (filtros.status && agendamento.status !== filtros.status) {
      return false;

    }
    
    // Filtro por data início
    if (filtros.data_inicio) {
      const dataEvento = new Date(agendamento.data_evento);
      const dataInicio = new Date(filtros.data_inicio);
      if (dataEvento < dataInicio) {
        return false;
      }
    }
    
    // Filtro por data fim
    if (filtros.data_fim) {
      const dataEvento = new Date(agendamento.data_evento);
      const dataFim = new Date(filtros.data_fim);
      if (dataEvento > dataFim) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Google Calendar Integration */}
      <GoogleCalendarConnect />
      
      {/* Botão Novo Agendamento */}
      <div className="flex justify-end">
        <button
          onClick={handleNovoAgendamento}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Novo Agendamento
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Evento
            </label>
            <select
              value={filtros.tipo_evento}
              onChange={(e) => setFiltros({ ...filtros, tipo_evento: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos os tipos</option>
              {tiposEvento.map(tipo => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filtros.status}
              onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos os status</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Início
            </label>
            <input
              type="date"
              value={filtros.data_inicio}
              onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Fim
            </label>
            <input
              type="date"
              value={filtros.data_fim}
              onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Formulário Modal */}
      {showForm && user && token && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {editando ? 'Editar Agendamento' : 'Novo Agendamento'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditando(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Conteúdo do Modal */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Digite o título do agendamento"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Evento <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.tipo_evento}
                      onChange={(e) => setFormData({ ...formData, tipo_evento: e.target.value })}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      {tiposEvento.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data e Hora <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.data_evento}
                      onChange={(e) => setFormData({ ...formData, data_evento: e.target.value })}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      {statusOptions.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Local
                  </label>
                  <input
                    type="text"
                    value={formData.local}
                    onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Local do evento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={3}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descrição detalhada do agendamento"
                  />
                </div>

                {/* Botões */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditando(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Salvando...' : (editando ? 'Atualizar' : 'Criar')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

        {/* Lista de Agendamentos */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredAgendamentos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {agendamentos.length === 0 ? 'Nenhum agendamento ainda' : 'Nenhum resultado encontrado'}
              </h3>
              <p className="text-gray-500 mb-4">
                {agendamentos.length === 0 
                  ? 'Comece criando seu primeiro agendamento.'
                  : 'Ajuste os filtros para encontrar os agendamentos que procura.'
                }
              </p>
              {agendamentos.length === 0 && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Criar Primeiro Agendamento
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredAgendamentos.map((agendamento) => (
                  <li key={agendamento.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {agendamento.titulo}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                            {getStatusLabel(agendamento.status)}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoEventoColor(agendamento.tipo_evento)}`}>
                            {getTipoEventoLabel(agendamento.tipo_evento)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <strong>Data:</strong> {formatDateTime(agendamento.data_evento)}
                          </div>
                          {agendamento.local && (
                            <div>
                              <strong>Local:</strong> {agendamento.local}
                            </div>
                          )}
                          {agendamento.criador && (
                            <div>
                              <strong>Criado por:</strong> {agendamento.criador.nome}
                            </div>
                          )}
                          {agendamento.destinatario && agendamento.destinatario.id !== agendamento.criador?.id && (
                            <div>
                              <strong>Destinatário:</strong> {agendamento.destinatario.nome}
                            </div>
                          )}
                        </div>
                        
                        {agendamento.descricao && (
                          <p className="mt-2 text-sm text-gray-600">{agendamento.descricao}</p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(agendamento)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(agendamento.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

export default AgendamentoManager;
