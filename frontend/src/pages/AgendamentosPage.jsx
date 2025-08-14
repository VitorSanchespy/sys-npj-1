import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Search, Filter, Edit, Trash2, ExternalLink } from 'lucide-react';
import { apiRequest } from '@/api/apiRequest';
import { useAuthContext } from '@/contexts/AuthContext';
import { useGoogleCalendar } from '@/contexts/GoogleCalendarContext';
import Button from '@/components/common/Button';
import AgendamentoForm from '../components/agendamentos/AgendamentoForm';

const AgendamentosPage = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    tipo_evento: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const { token } = useAuthContext();
  const { isConnected, connectCalendar, loading: calendarLoading } = useGoogleCalendar();

  // Carregar agendamentos
  const loadAgendamentos = async (page = 1) => {
    if (!isConnected) return;

    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.tipo_evento && { tipo_evento: filters.tipo_evento })
      });

      const response = await apiRequest(`/api/agendamentos-global?${queryParams}`, {
        method: 'GET',
        token
      });
      
      if (response.success) {
        setAgendamentos(response.data.agendamentos || []);
        setPagination(response.data.pagination || pagination);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar processos disponíveis para agendamento
  const loadProcessos = async () => {
    try {
      const response = await apiRequest('/api/agendamentos/processos-disponiveis', {
        method: 'GET',
        token
      });
      if (response.processos) {
        setProcessos(response.processos);
      } else if (response.data && response.data.processos) {
        setProcessos(response.data.processos);
      } else {
        setProcessos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
      setProcessos([]);
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadAgendamentos();
      loadProcessos();
    }
  }, [isConnected, filters.status, filters.tipo_evento]);

  // Abrir formulário
  const openForm = (agendamento = null) => {
    setEditingAgendamento(agendamento);
    setShowForm(true);
  };

  // Fechar formulário
  const closeForm = () => {
    setShowForm(false);
    setEditingAgendamento(null);
  };

  // Cancelar agendamento
  const cancelAgendamento = async (id) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return;
    }

    try {
      const response = await apiRequest(`/api/agendamentos-global/${id}`, {
        method: 'DELETE',
        token
      });

      if (response.success) {
        await loadAgendamentos(pagination.page);
        alert('Agendamento cancelado!');
      } else {
        alert(`Erro: ${response.message}`);
      }
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      alert('Erro ao cancelar agendamento');
    }
  };

  // Formatação de data/hora
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    
    console.log('🗂️ LISTA - formatDateTime recebeu:', dateString, 'tipo:', typeof dateString);
    
    // Para objetos Date vindos do banco (UTC)
    if (dateString instanceof Date || (typeof dateString === 'string' && dateString.endsWith('Z'))) {
      const utcDate = new Date(dateString);
      // Converte UTC para horário de Brasília (UTC - 3 horas)
      const brasiliaDate = new Date(utcDate.getTime() - 3 * 60 * 60 * 1000);
      
      console.log('🗂️ LISTA - UTC original:', utcDate);
      console.log('🗂️ LISTA - Brasília convertida:', brasiliaDate);
      
      const result = brasiliaDate.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      console.log('🗂️ LISTA - Resultado final:', result);
      return result;
    }
    
    // Para strings com offset já definido
    let processedDate = dateString;
    if (typeof dateString === 'string' && dateString.includes('-03:00')) {
      processedDate = dateString.replace('-03:00', '');
      console.log('🗂️ LISTA - Removeu offset, agora:', processedDate);
    }
    
    const date = new Date(processedDate);
    console.log('🗂️ LISTA - Date object:', date);
    
    const result = date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
    
    console.log('🗂️ LISTA - Resultado final:', result);
    return result;
  };

  // Status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pendente: { color: 'bg-yellow-100 text-yellow-800', text: 'Pendente' },
      sincronizado: { color: 'bg-green-100 text-green-800', text: 'Sincronizado' },
      cancelado: { color: 'bg-red-100 text-red-800', text: 'Cancelado' }
    };

    const config = statusConfig[status] || statusConfig.pendente;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // Se não conectado ao Google Calendar
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-12 text-center border border-blue-200">
          <Calendar size={64} className="mx-auto text-blue-600 mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Agendamentos
          </h1>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
            Para visualizar e gerenciar seus agendamentos, você precisa conectar sua conta do Google Calendar.
            Isso permitirá sincronizar todos os eventos relacionados aos processos do NPJ.
          </p>
          <Button
            onClick={connectCalendar}
            disabled={calendarLoading}
            variant="primary"
            className="px-8 py-4 text-lg"
          >
            {calendarLoading ? 'Conectando...' : 'Conectar Google Calendar'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-600 mt-2">Gerencie todos os agendamentos dos processos</p>
        </div>
        <Button
          onClick={() => openForm()}
          variant="primary"
          disabled={loading}
        >
          <Plus size={20} className="mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="sincronizado">Sincronizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Evento
            </label>
            <select
              value={filters.tipo_evento}
              onChange={(e) => setFilters({ ...filters, tipo_evento: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os tipos</option>
              <option value="Reunião">Reunião</option>
              <option value="Audiência">Audiência</option>
              <option value="Entrevista">Entrevista</option>
              <option value="Acompanhamento">Acompanhamento</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Buscar por título ou processo..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando agendamentos...</p>
        </div>
      )}

      {/* Tabela de agendamentos */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora Início
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora Fim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agendamentos.map((agendamento) => (
                  <tr key={agendamento.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {agendamento.summary || 'Agendamento NPJ'}
                        </div>
                        {agendamento.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {agendamento.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {agendamento.tipo_evento || 'Reunião'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(agendamento.start)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(agendamento.end)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`/processos/${agendamento.processo_id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Processo #{agendamento.processo_id}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(agendamento.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {agendamento.google_event_id && (
                          <a
                            href={`https://calendar.google.com/calendar/event?eid=${agendamento.google_event_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700"
                            title="Ver no Google Calendar"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <button
                          onClick={() => openForm(agendamento)}
                          className="p-2 rounded bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-pen" aria-hidden="true">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <path d="M16.5 8.5l-9 9" />
                            <path d="M18.5 6.5a2.121 2.121 0 0 1 3 3l-1.5 1.5-3-3 1.5-1.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => cancelAgendamento(agendamento.id)}
                          className="p-2 rounded bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          title="Cancelar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2" aria-hidden="true">
                            <path d="M3 6h18" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  onClick={() => loadAgendamentos(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  variant="outline"
                >
                  Anterior
                </Button>
                <Button
                  onClick={() => loadAgendamentos(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  variant="outline"
                >
                  Próximo
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{' '}
                    <span className="font-medium">
                      {((pagination.page - 1) * pagination.limit) + 1}
                    </span>{' '}
                    até{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    de{' '}
                    <span className="font-medium">{pagination.total}</span>{' '}
                    resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => loadAgendamentos(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pagination.page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Nenhum resultado */}
          {agendamentos.length === 0 && !loading && (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum agendamento encontrado
              </h3>
              <p className="text-gray-600">
                Crie seu primeiro agendamento clicando no botão "Novo Agendamento".
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal do formulário */}
      {showForm && (
        <AgendamentoForm
          agendamento={editingAgendamento}
          processos={processos}
          onClose={closeForm}
          onSave={() => {
            closeForm();
            loadAgendamentos(pagination.page);
          }}
        />
      )}
    </div>
  );
};

export default AgendamentosPage;
