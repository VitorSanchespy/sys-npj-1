import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { getUserRole } from "../hooks/useApi";
import GoogleCalendarConnect from './GoogleCalendarConnect';
import { 
  useAgendamentos, 
  useCreateAgendamento, 
  useUpdateAgendamento, 
  useDeleteAgendamento,
  useSincronizarGoogleCalendar,
  useEstatisticasAgendamentos
} from '../hooks/useAgendamentos';
import { apiRequest } from '../api/apiRequest';

const AgendamentoManager = ({ processoId = null }) => {
  const { user, token } = useAuthContext();
  const userRole = getUserRole(user);
  
  // Usar os novos hooks
  // data is the full response object, agendamentos is the array inside it
  const { data, isLoading: loading, error: queryError, refetch } = useAgendamentos();
  const agendamentos = (data && Array.isArray(data.agendamentos)) ? data.agendamentos : [];
  const { data: estatisticas } = useEstatisticasAgendamentos();
  const createAgendamento = useCreateAgendamento();
  const updateAgendamento = useUpdateAgendamento();
  const deleteAgendamento = useDeleteAgendamento();
  const sincronizarGoogle = useSincronizarGoogleCalendar();
  
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [filtros, setFiltros] = useState({
    tipo_evento: '',
    status: '',
    data_inicio: '',
    data_fim: ''
  });

  // Função para invalidar cache e buscar dados atuais
  const handleAtualizarDados = async () => {
    try {
      setError(null);
      console.log('🔄 Forçando atualização dos dados...');
      
      // Limpar cache local se disponível
      if (window.clearCache) {
        window.clearCache();
      }
      
      // Chamar endpoint para invalidar cache
      const response = await fetch('/api/agendamentos/invalidar-cache', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Cache invalidado:', result);
        
        // Forçar recarregamento dos dados
        refetch();
        
        // Feedback visual
        setError(null);
        alert('Dados atualizados com sucesso! Agendamentos agora refletem o banco de dados.');
      } else {
        throw new Error('Erro ao atualizar dados');
      }
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      setError('Erro ao atualizar dados. Tente recarregar a página.');
    }
  };

  // Google Calendar compatible fields only
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    local: '',
    convidados: '',
  });

  // Ensure all form fields are always strings (never undefined/null)
  const safeFormData = {
    titulo: formData.titulo || '',
    descricao: formData.descricao || '',
    data_inicio: formData.data_inicio || '',
    data_fim: formData.data_fim || '',
    local: formData.local || '',
    convidados: formData.convidados || '',
  };

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
    carregarUsuarios();
  }, [user, token]);

  // Atualizar erro quando houver erro da query
  useEffect(() => {
    if (queryError) {
      setError(queryError.message || 'Erro ao carregar agendamentos');
    } else {
      setError(null);
    }
  }, [queryError]);

  // Função para carregar usuários disponíveis para agendamento
  const carregarUsuarios = async () => {
    if (!user || !token) return;
    if (userRole === 'Aluno') return;
    try {
      const response = await apiRequest('/api/usuarios', {
        method: 'GET',
        token: token
      });
      
      // Log de desenvolvimento para debug
      if (process.env.NODE_ENV === 'development') {
        console.log('Usuários carregados:', response);
      }
      
      setUsuarios(Array.isArray(response) ? response : (response.data || []));
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleSincronizarGoogle = async (agendamentoId) => {
    try {
      await sincronizarGoogle.mutateAsync(agendamentoId);
      setError(null);
      // Mostrar mensagem de sucesso
      alert('Agendamento sincronizado com Google Calendar!');
    } catch (error) {
      setError('Erro ao sincronizar com Google Calendar: ' + error.message);
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
        await deleteAgendamento.mutateAsync(id);
        setError(null);
      } catch (error) {
        setError('Erro ao excluir agendamento: ' + error.message);
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
      setError(null);
      // Prepare Google Calendar event data
      const dadosEnvio = {
        // For backend compatibility
        titulo: safeFormData.titulo,
        descricao: safeFormData.descricao,
        data_inicio: safeFormData.data_inicio,
        data_fim: safeFormData.data_fim,
        local: safeFormData.local,
        convidados: safeFormData.convidados,
        data_evento: safeFormData.data_inicio ? new Date(safeFormData.data_inicio).toISOString() : undefined, // Necessário para o backend
        // For Google Calendar compatibility
        summary: safeFormData.titulo,
        description: safeFormData.descricao,
        start: safeFormData.data_inicio ? new Date(safeFormData.data_inicio).toISOString() : undefined,
        end: safeFormData.data_fim ? new Date(safeFormData.data_fim).toISOString() : undefined,
        location: safeFormData.local,
        attendees: safeFormData.convidados
          ? safeFormData.convidados.split(',').map(email => ({ email: email.trim() }))
          : [],
      };
      if (process.env.NODE_ENV === 'development') {
        console.log('📤 Dados Google Calendar:', dadosEnvio);
      }
      if (editando) {
        await updateAgendamento.mutateAsync({ id: editando, agendamentoData: dadosEnvio });
      } else {
        await createAgendamento.mutateAsync(dadosEnvio);
      }
      setShowForm(false);
      setEditando(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      if (error?.message?.includes('Google Calendar')) {
        setError('Erro ao criar/editar evento: Google Calendar não conectado ou permissão negada.');
      } else {
        setError(error.message || 'Erro ao salvar agendamento');
      }
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
      
      {/* Estatísticas (apenas para Admin e Professor) */}
      {(userRole === 'Admin' || userRole === 'Professor') && estatisticas && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Estatísticas dos Agendamentos</h3>
            <button
              onClick={() => setShowStats(!showStats)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {showStats ? 'Ocultar' : 'Mostrar'} Detalhes
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{estatisticas.total}</div>
              <div className="text-sm text-blue-600">Total</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{estatisticas.proximosAgendamentos}</div>
              <div className="text-sm text-green-600">Próximos 7 dias</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{estatisticas.vencidos}</div>
              <div className="text-sm text-red-600">Vencidos</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {estatisticas.porStatus?.agendado || 0}
              </div>
              <div className="text-sm text-yellow-600">Agendados</div>
            </div>
          </div>
          
          {showStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div>
                <h4 className="font-medium mb-2">Por Status</h4>
                <div className="space-y-2">
                  {Object.entries(estatisticas.porStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex justify-between">
                      <span className="capitalize">{status}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Por Tipo</h4>
                <div className="space-y-2">
                  {Object.entries(estatisticas.porTipo || {}).map(([tipo, count]) => (
                    <div key={tipo} className="flex justify-between">
                      <span className="capitalize">{getTipoEventoLabel(tipo)}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Botões de Ação */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleAtualizarDados}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          🔄 Atualizar Dados
        </button>
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
                      value={safeFormData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Digite o título do evento"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data e Hora de Início <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={safeFormData.data_inicio}
                      onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data e Hora de Fim <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={safeFormData.data_fim}
                      onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Local
                    </label>
                    <input
                      type="text"
                      value={safeFormData.local}
                      onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Local do evento"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Convidados (e-mails separados por vírgula)
                    </label>
                    <input
                      type="text"
                      value={safeFormData.convidados}
                      onChange={(e) => setFormData({ ...formData, convidados: e.target.value })}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="exemplo@email.com, outro@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={safeFormData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={3}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descrição detalhada do evento"
                  />
                </div>
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
                    disabled={createAgendamento.isLoading || updateAgendamento.isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {createAgendamento.isLoading || updateAgendamento.isLoading 
                      ? 'Salvando...' 
                      : (editando ? 'Atualizar' : 'Criar')
                    }
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
                          {agendamento.googleEventId && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800" title="Sincronizado com Google Calendar">
                              📅 Google
                            </span>
                          )}
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
                        
                        {/* Botão para sincronizar com Google Calendar */}
                        {user?.googleCalendarConnected && (
                          <button
                            onClick={() => handleSincronizarGoogle(agendamento.id)}
                            disabled={sincronizarGoogle.isLoading}
                            className="inline-flex items-center px-3 py-1.5 border border-green-300 shadow-sm text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            title={agendamento.googleEventId ? 'Atualizar no Google Calendar' : 'Sincronizar com Google Calendar'}
                          >
                            {sincronizarGoogle.isLoading ? '...' : (agendamento.googleEventId ? '🔄' : '📅')}
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDelete(agendamento.id)}
                          disabled={deleteAgendamento.isLoading}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          {deleteAgendamento.isLoading ? '...' : 'Excluir'}
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
