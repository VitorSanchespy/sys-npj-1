import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import GoogleCalendarConnect from './GoogleCalendarConnect';
import { useAgendamentoAutoRefresh } from '../hooks/useAutoRefresh';
import {
  useAgendamentos,
  useEstatisticasAgendamentos,
  useCreateAgendamento,
  useUpdateAgendamento,
  useDeleteAgendamento,
  useSincronizarGoogleCalendar,
  useInvalidateCache,
  useConnectionStatus
} from '../hooks/agendamentoHooks';

const AgendamentoManager = ({ processoId = null }) => {
  const { user, token } = useAuthContext();
  const userRole = user?.role?.nome || user?.Role?.nome || 'Aluno';
  
  // Auto-refresh hook para agendamentos
  const { afterCreateAgendamento, afterUpdateAgendamento, afterDeleteAgendamento } = useAgendamentoAutoRefresh();
  
  // Usar os novos hooks refatorados
  const { data, isLoading: loading, error: queryError, refetch } = useAgendamentos({ limit: 1000 });
  const agendamentos = (data && data.success && Array.isArray(data.agendamentos)) ? data.agendamentos : [];
  const { data: connectionStatus } = useConnectionStatus();
  const createAgendamento = useCreateAgendamento();
  const updateAgendamento = useUpdateAgendamento();
  const deleteAgendamento = useDeleteAgendamento();
  const sincronizarGoogle = useSincronizarGoogleCalendar();
  
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtros, setFiltros] = useState({
    tipo_evento: '',
    status: '',
    data_inicio: '',
    data_fim: ''
  });

  const itemsPorPagina = 10;

  // Auto-atualização: recarregar dados a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Auto-atualização: ao entrar na página
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Campos compatíveis apenas com Google Calendar
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    local: '',
    convidados: '',
    tipo_evento: 'reuniao',
    status: 'agendado'
  });

  // Garantir que todos os campos do formulário sejam sempre strings (nunca undefined/null)
  const safeFormData = {
    titulo: formData.titulo || '',
    descricao: formData.descricao || '',
    data_inicio: formData.data_inicio || '',
    data_fim: formData.data_fim || '',
    local: formData.local || '',
    convidados: formData.convidados || '',
    tipo_evento: formData.tipo_evento || 'reuniao',
    status: formData.status || 'agendado'
  };

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
    if (queryError) {
      setError(queryError.message || 'Erro ao carregar agendamentos');
    } else {
      setError(null);
    }
  }, [queryError]);

  const getTipoEventoColor = (tipo) => {
    const cores = {
      'audiencia': 'bg-red-100 text-red-800',
      'prazo': 'bg-yellow-100 text-yellow-800',
      'reuniao': 'bg-blue-100 text-blue-800',
      'diligencia': 'bg-green-100 text-green-800',
      'outro': 'bg-gray-100 text-gray-800'
    };
    return cores[tipo] || cores['outro'];
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

  const getStatusColor = (status) => {
    const cores = {
      'agendado': 'bg-blue-100 text-blue-800',
      'realizado': 'bg-green-100 text-green-800',
      'cancelado': 'bg-red-100 text-red-800',
      'adiado': 'bg-yellow-100 text-yellow-800'
    };
    return cores[status] || cores['agendado'];
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

  // Corrigir formatDateTime para somar 3 horas ao UTC e exibir corretamente em horário de Brasília (UTC-3)
  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    // Garante que a string seja tratada como UTC
    const date = new Date(dateTime);
    // Soma 3 horas para UTC-3 (Brasília)
    const brasiliaDate = new Date(date.getTime() + 3 * 60 * 60 * 1000);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(brasiliaDate.getDate())}/${pad(brasiliaDate.getMonth() + 1)}/${brasiliaDate.getFullYear()} ${pad(brasiliaDate.getHours())}:${pad(brasiliaDate.getMinutes())}`;
  };

  // Calcular estatísticas em tempo real baseadas nos agendamentos carregados
  const getEstatisticasReais = () => {
    if (!agendamentos || agendamentos.length === 0) {
      return {
        total: 0,
        porTipo: {},
        porStatus: {},
        proximos7Dias: 0,
        vencidos: 0,
        hoje: 0
      };
    }

    const agora = new Date();
    const seteDiasAFrente = new Date(agora.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    const estatisticas = {
      total: agendamentos.length,
      porTipo: {},
      porStatus: {},
      proximos7Dias: 0,
      vencidos: 0,
      hoje: 0
    };

    agendamentos.forEach(agendamento => {
      // Por tipo de evento
      const tipo = agendamento.tipo_evento || 'outro';
      estatisticas.porTipo[tipo] = (estatisticas.porTipo[tipo] || 0) + 1;

      // Por status
      const status = agendamento.status || 'agendado';
      estatisticas.porStatus[status] = (estatisticas.porStatus[status] || 0) + 1;

      // Data do evento
      const dataEvento = new Date(agendamento.data_inicio || agendamento.dataEvento || agendamento.data_evento);
      
      // Vencidos (data passou e status ainda é agendado)
      if (dataEvento < agora && status === 'agendado') {
        estatisticas.vencidos++;
      }

      // Próximos 7 dias
      if (dataEvento >= agora && dataEvento <= seteDiasAFrente) {
        estatisticas.proximos7Dias++;
      }

      // Hoje
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const amanha = new Date(hoje.getTime() + (24 * 60 * 60 * 1000));
      if (dataEvento >= hoje && dataEvento < amanha) {
        estatisticas.hoje++;
      }
    });

    return estatisticas;
  };

  const estatisticasReais = getEstatisticasReais();

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

  const handleEdit = (agendamento) => {
    // Converter data para formato datetime-local para edição
    let dataInicioFormatada = '';
    let dataFimFormatada = '';

    try {
      const dataInicio = agendamento.data_inicio || agendamento.dataEvento || agendamento.data_evento;
      if (dataInicio) {
        const data = new Date(dataInicio);
        if (!isNaN(data.getTime())) {
          dataInicioFormatada = data.toISOString().slice(0, 16);
        }
      }
    } catch (error) {
      console.warn('Erro ao formatar data de início:', error);
      dataInicioFormatada = new Date().toISOString().slice(0, 16);
    }

    try {
      const dataFim = agendamento.data_fim || agendamento.dataFim;
      if (dataFim) {
        const data = new Date(dataFim);
        if (!isNaN(data.getTime())) {
          dataFimFormatada = data.toISOString().slice(0, 16);
        }
      }
    } catch (error) {
      console.warn('Erro ao formatar data de fim:', error);
      if (dataInicioFormatada) {
        try {
          const inicioDate = new Date(dataInicioFormatada);
          dataFimFormatada = new Date(inicioDate.getTime() + 60*60*1000).toISOString().slice(0, 16);
        } catch {
          dataFimFormatada = '';
        }
      }
    }
    
    setFormData({
      titulo: agendamento.titulo || '',
      descricao: agendamento.descricao || '',
      data_inicio: dataInicioFormatada,
      data_fim: dataFimFormatada,
      local: agendamento.local || '',
      convidados: agendamento.convidados || '',
      tipo_evento: agendamento.tipo_evento || agendamento.tipoEvento || 'reuniao',
      status: agendamento.status || 'agendado',
      processoId: agendamento.processoId || agendamento.processo_id || null
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
        afterDeleteAgendamento(); // Auto-refresh após exclusão
        console.log('📅 Agendamento excluído - dados atualizados automaticamente');
      } catch (error) {
        setError('Erro ao excluir agendamento: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      data_inicio: '',
      data_fim: '',
      local: '',
      convidados: '',
      tipo_evento: 'reuniao',
      status: 'agendado',
      processoId: processoId || null
    });
    setEditando(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !token) return;

    if (!formData.titulo || !formData.data_inicio) {
      setError('Título e data de início são obrigatórios');
      return;
    }

    try {
      setError(null);

      // Função para converter string datetime-local (Brasília) para UTC ISO string
      function brasiliaToUTCISOString(dtStr) {
        if (!dtStr) return undefined;
        // dtStr: 'YYYY-MM-DDTHH:mm' (assumido em Brasília)
        const [datePart, timePart] = dtStr.split('T');
        if (!datePart || !timePart) return undefined;
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);
        // Cria Date como se fosse no horário de Brasília (UTC-3)
        const date = new Date(Date.UTC(year, month - 1, day, hour + 3, minute));
        // Subtrai 3 horas para converter para UTC
        date.setUTCHours(date.getUTCHours() - 3);
        return date.toISOString();
      }

      const dadosEnvio = {
        titulo: formData.titulo,
        descricao: formData.descricao || '',
        data_inicio: formData.data_inicio ? brasiliaToUTCISOString(formData.data_inicio) : new Date().toISOString(),
        data_fim: formData.data_fim ? brasiliaToUTCISOString(formData.data_fim) : (() => {
          // Se não houver data_fim, adiciona 1h à data_inicio
          if (formData.data_inicio) {
            const [datePart, timePart] = formData.data_inicio.split('T');
            if (datePart && timePart) {
              const [year, month, day] = datePart.split('-').map(Number);
              const [hour, minute] = timePart.split(':').map(Number);
              let endHour = hour + 1;
              let endDay = day;
              let endMonth = month;
              let endYear = year;
              if (endHour >= 24) {
                endHour = endHour - 24;
                endDay++;
                // Ajuste simples para mês/ano (não cobre todos os casos de mês)
                if (endDay > 28) {
                  const tempDate = new Date(year, month - 1, endDay);
                  if (tempDate.getMonth() !== month - 1) {
                    endDay = 1;
                    endMonth++;
                    if (endMonth > 12) {
                      endMonth = 1;
                      endYear++;
                    }
                  }
                }
              }
              const endStr = `${endYear.toString().padStart(4, '0')}-${endMonth.toString().padStart(2, '0')}-${endDay.toString().padStart(2, '0')}T${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
              return brasiliaToUTCISOString(endStr);
            }
          }
          return new Date().toISOString();
        })(),
        local: formData.local || '',
        convidados: formData.convidados ?
          formData.convidados.split(',')
            .map(email => email.trim())
            .filter(email => email && email.includes('@'))
            .join(', ') : '',
        tipo_evento: formData.tipo_evento || 'reuniao',
        status: formData.status || 'agendado',
        processo_id: formData.processoId || processoId || null
      };

      if (editando) {
        await updateAgendamento.mutateAsync({ id: editando, agendamentoData: dadosEnvio });
        afterUpdateAgendamento();
        console.log('📅 Agendamento atualizado - dados atualizados automaticamente');
      } else {
        await createAgendamento.mutateAsync(dadosEnvio);
        afterCreateAgendamento();
        console.log('📅 Agendamento criado - dados atualizados automaticamente');
      }

      setShowForm(false);
      resetForm();

      alert(editando ? 'Agendamento atualizado com sucesso!' : 'Agendamento criado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      setError(error.message || 'Erro ao salvar agendamento');
    }
  };

  const handleSincronizarGoogle = async (agendamentoId) => {
    try {
      await sincronizarGoogle.mutateAsync(agendamentoId);
      setError(null);
      afterUpdateAgendamento(); // Auto-refresh após sincronização
      console.log('📅 Agendamento sincronizado - dados atualizados automaticamente');
      alert('Agendamento sincronizado com Google Calendar!');
    } catch (error) {
      setError('Erro ao sincronizar: ' + error.message);
    }
  };

  // Filtragem dos agendamentos
  const hasActiveFilters = filtros.tipo_evento || filtros.status || filtros.data_inicio || filtros.data_fim;
  
  const filteredAgendamentos = hasActiveFilters ? agendamentos.filter(agendamento => {
    if (filtros.tipo_evento && agendamento.tipo_evento !== filtros.tipo_evento) {
      return false;
    }
    
    if (filtros.status && agendamento.status !== filtros.status) {
      return false;
    }
    
    if (filtros.data_inicio) {
      const dataEvento = new Date(agendamento.data_inicio || agendamento.dataEvento || agendamento.data_evento);
      const dataInicio = new Date(filtros.data_inicio);
      if (dataEvento < dataInicio) {
        return false;
      }
    }
    
    if (filtros.data_fim) {
      const dataEvento = new Date(agendamento.data_inicio || agendamento.dataEvento || agendamento.data_evento);
      const dataFim = new Date(filtros.data_fim);
      if (dataEvento > dataFim) {
        return false;
      }
    }
    
    return true;
  }) : agendamentos;

  // Paginação
  const totalPaginas = Math.ceil(filteredAgendamentos.length / itemsPorPagina);
  const inicio = (currentPage - 1) * itemsPorPagina;
  const agendamentosPaginados = filteredAgendamentos.slice(inicio, inicio + itemsPorPagina);

  return (
    <div className="space-y-6">
      <GoogleCalendarConnect />
      
      {/* Estatísticas Melhoradas */}
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
            <div className="text-2xl font-bold text-blue-600">{estatisticasReais.total}</div>
            <div className="text-sm text-blue-600">Total</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{estatisticasReais.proximos7Dias}</div>
            <div className="text-sm text-green-600">Próximos 7 dias</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{estatisticasReais.vencidos}</div>
            <div className="text-sm text-red-600">Vencidos</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{estatisticasReais.hoje}</div>
            <div className="text-sm text-yellow-600">Hoje</div>
          </div>
        </div>
        
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div>
              <h4 className="font-medium mb-2">Por Tipo de Evento</h4>
              <div className="space-y-2">
                {Object.entries(estatisticasReais.porTipo).map(([tipo, count]) => (
                  <div key={tipo} className="flex justify-between">
                    <span className="capitalize">{getTipoEventoLabel(tipo)}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Por Status</h4>
              <div className="space-y-2">
                {Object.entries(estatisticasReais.porStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between">
                    <span className="capitalize">{getStatusLabel(status)}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-3">
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
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                      Tipo de Evento <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={safeFormData.tipo_evento}
                      onChange={(e) => setFormData({ ...formData, tipo_evento: e.target.value })}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione o tipo</option>
                      {tiposEvento.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                      ))}
                    </select>
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

      {/* Lista de Agendamentos com Paginação */}
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
              {agendamentosPaginados.map((agendamento) => (
                <li key={agendamento.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {agendamento.titulo}
                        </h3>
                        {agendamento.googleEventId && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800" title="Sincronizado com Google Calendar">
                            Google
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
                          <strong>Data:</strong> {formatDateTime(agendamento.data_inicio || agendamento.dataEvento || agendamento.data_evento)}
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

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(agendamento)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Editar
                      </button>
                      
                      {connectionStatus?.isGoogleConnected && (
                        <button
                          onClick={() => handleSincronizarGoogle(agendamento.id)}
                          disabled={sincronizarGoogle.isLoading}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                          title={agendamento.googleEventId ? 'Atualizar no Google Calendar' : 'Sincronizar com Google Calendar'}
                        >
                          {sincronizarGoogle.isLoading ? '...' : (agendamento.googleEventId ? 'Atualizar' : 'Sincronizar')}
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
        
        {/* Controles de Paginação */}
        {filteredAgendamentos.length > itemsPorPagina && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPaginas, currentPage + 1))}
                disabled={currentPage === totalPaginas}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{inicio + 1}</span> a{' '}
                  <span className="font-medium">{Math.min(inicio + itemsPorPagina, filteredAgendamentos.length)}</span> de{' '}
                  <span className="font-medium">{filteredAgendamentos.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    ← Anterior
                  </button>
                  
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPaginas, currentPage + 1))}
                    disabled={currentPage === totalPaginas}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Próxima →
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendamentoManager;
