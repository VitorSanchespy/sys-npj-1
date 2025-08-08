import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/apiRequest';
import { useAuthContext } from '@/contexts/AuthContext';
import { useQueryClient } from "@tanstack/react-query";
import { getUserRole } from "../hooks/useApi";
import { requestCache } from "../utils/requestCache";

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
      'agendado': 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300',
      'realizado': 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300',
      'cancelado': 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300',
      'adiado': 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-300'
    };
    return cores[status] || 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-300';
  };

  const getTipoColor = (tipo) => {
    const cores = {
      'audiencia': 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300',
      'prazo': 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300',
      'reuniao': 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300',
      'diligencia': 'bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 border-teal-300',
      'outro': 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-300'
    };
    return cores[tipo] || 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-300';
  };

  const getTipoEventoColor = (tipo) => {
    const cores = {
      'audiencia': 'bg-gradient-to-r from-violet-100 to-violet-200 text-violet-800 border-violet-300',
      'prazo': 'bg-gradient-to-r from-rose-100 to-rose-200 text-rose-800 border-rose-300',
      'reuniao': 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300',
      'diligencia': 'bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-800 border-cyan-300',
      'outro': 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-300'
    };
    return cores[tipo] || 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-300';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Moderno */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                📅 Agendamentos
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl">
                Organize seus compromissos, prazos e audiências de forma inteligente
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  {filteredAgendamentos.length} agendamentos
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Sistema atualizado
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleNovoAgendamento}
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                <span className="relative">
                  Novo Agendamento
                </span>
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg shadow-sm">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filtros Modernos */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
            </div>
            <h3 className="text-xl font-bold text-slate-800">Filtros Inteligentes</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Tipo de Evento
              </label>
              <div className="relative">
                <select
                  value={filtros.tipo_evento}
                  onChange={(e) => setFiltros({ ...filtros, tipo_evento: e.target.value })}
                  className="w-full appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-3 pr-10 text-slate-700 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                >
                  <option value="">Todos os tipos</option>
                  {tiposEvento.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Status
              </label>
              <div className="relative">
                <select
                  value={filtros.status}
                  onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                  className="w-full appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-3 pr-10 text-slate-700 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                >
                  <option value="">Todos os status</option>
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Data Início
              </label>
              <input
                type="date"
                value={filtros.data_inicio}
                onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })}
                className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Data Fim
              </label>
              <input
                type="date"
                value={filtros.data_fim}
                onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })}
                className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              />
            </div>
          </div>
        </div>

      {/* Formulário Modal */}
      {showForm && user && token && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  {editando ? 'Editar Agendamento' : 'Novo Agendamento'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditando(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Conteúdo do Modal */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações Básicas */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Informações Básicas
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.titulo}
                        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Digite o título do agendamento"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Evento <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.tipo_evento}
                        onChange={(e) => setFormData({ ...formData, tipo_evento: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {tiposEvento.map(tipo => (
                          <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data e Hora <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.data_evento}
                        onChange={(e) => setFormData({ ...formData, data_evento: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {statusOptions.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Local
                    </label>
                    <input
                      type="text"
                      value={formData.local}
                      onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Local do evento"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Descrição detalhada do agendamento"
                    />
                  </div>
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
                    className="px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {editando ? 'Atualizar' : 'Criar'} Agendamento
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

        {/* Lista de Agendamentos Moderna */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">
              Seus Agendamentos
            </h2>
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
              <span className="text-sm font-semibold text-slate-700">
                {filteredAgendamentos.length} {filteredAgendamentos.length === 1 ? 'agendamento' : 'agendamentos'}
              </span>
            </div>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" style={{animationDelay: '0.1s'}}></div>
              </div>
              <p className="mt-6 text-lg text-slate-600 font-medium">Carregando agendamentos...</p>
            </div>
          ) : filteredAgendamentos.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl mb-6">
                <span className="text-4xl">📅</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                {agendamentos.length === 0 ? 'Nenhum agendamento ainda' : 'Nenhum resultado encontrado'}
              </h3>
              <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
                {agendamentos.length === 0 
                  ? 'Comece organizando seus compromissos e nunca mais perca um prazo importante.'
                  : 'Ajuste os filtros para encontrar os agendamentos que procura.'
                }
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Criar Primeiro Agendamento
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredAgendamentos.map((agendamento) => (
                <div key={agendamento.id} className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                  {/* Header do Card */}
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                          <div className="w-6 h-6"></div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                            {agendamento.titulo}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(agendamento.status)}`}>
                              <div className="w-2 h-2 rounded-full bg-current mr-2"></div>
                              {getStatusLabel(agendamento.status)}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${getTipoEventoColor(agendamento.tipo_evento)}`}>
                              {getTipoEventoLabel(agendamento.tipo_evento)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Ações */}
                    <div className="flex flex-row lg:flex-col gap-3">
                      <button
                        onClick={() => handleEdit(agendamento)}
                        className="group/btn flex items-center gap-2 px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 font-semibold rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-200"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(agendamento.id)}
                        className="group/btn flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 font-semibold rounded-xl border-2 border-red-200 hover:border-red-300 transition-all duration-200"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>



                  {/* Informações do Evento em Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Card: Data e Hora */}
                    <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border-l-4 border-blue-400">
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Data e Hora</span>
                      <span className="text-lg font-bold text-slate-800">{formatDateTime(agendamento.data_evento)}</span>
                    </div>
                    {/* Card: Local */}
                    {agendamento.local && (
                      <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border-l-4 border-purple-400">
                        <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Local</span>
                        <span className="text-lg font-bold text-slate-800">{agendamento.local}</span>
                      </div>
                    )}
                    {/* Card: Criado por */}
                    {agendamento.criador && (
                      <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border-l-4 border-green-400">
                        <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Criado por</span>
                        <span className="text-lg font-bold text-slate-800">{agendamento.criador.nome}</span>
                      </div>
                    )}
                    {/* Card: Destinatário */}
                    {agendamento.destinatario && agendamento.destinatario.id !== agendamento.criador?.id && (
                      <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border-l-4 border-cyan-400">
                        <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wider">Destinatário</span>
                        <span className="text-lg font-bold text-slate-800">{agendamento.destinatario.nome}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgendamentoManager;
