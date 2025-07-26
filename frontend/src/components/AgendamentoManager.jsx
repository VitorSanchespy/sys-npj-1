import React, { useState, useEffect } from 'react';
import { agendamentoService } from '../api/services';
import { processService } from '../api/services';
import { useAuthContext } from '../contexts/AuthContext';
// MainLayout removido: este componente NÃO deve importar ou usar MainLayout.

// Removido qualquer uso de MainLayout aqui. O componente exporta apenas o conteúdo da página.
const AgendamentoManager = ({ processoId = null }) => {
  const { user, token } = useAuthContext();
  const [agendamentos, setAgendamentos] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filtros, setFiltros] = useState({
    tipo: '',
    status: '',
    data_inicio: '',
    data_fim: ''
  });

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_evento: '',
    tipo: 'audiencia',
    processo_id: processoId || '',
    local_evento: '',
    lembrete_1_dia: true,
    lembrete_2_dias: true,
    lembrete_1_semana: false,
    status: 'agendado'
  });

  const tiposEvento = [
    { value: 'audiencia', label: 'Audiência' },
    { value: 'prazo', label: 'Prazo' },
    { value: 'reuniao', label: 'Reunião' },
    { value: 'evento', label: 'Evento' },
    { value: 'outros', label: 'Outros' }
  ];

  const statusOptions = [
    { value: 'agendado', label: 'Agendado' },
    { value: 'realizado', label: 'Realizado' },
    { value: 'cancelado', label: 'Cancelado' },
    { value: 'adiado', label: 'Adiado' }
  ];

  useEffect(() => {
    carregarAgendamentos();
    if (!processoId) {
      carregarProcessos();
    }
  }, [processoId, filtros]);

  const carregarProcessos = async () => {
    if (!user || !token) return;
    try {
      const response = await processService.listProcesses(token);
      setProcessos(response);
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
    }
  };

  const carregarAgendamentos = async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const response = await agendamentoService.listAgendamentos(token);
      setAgendamentos(response);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      console.error('Dados de usuário ou token não encontrados:', { user, token });
      alert('Erro: Usuário não autenticado');
      return;
    }
    
    console.log('Dados do formulário sendo enviados:', formData);
    
    try {
      if (editando) {
        await agendamentoService.updateAgendamento(token, editando, formData);
        console.log('Agendamento atualizado com sucesso');
      } else {
        const resultado = await agendamentoService.createAgendamento(token, formData);
        console.log('Agendamento criado com sucesso:', resultado);
      }
      setShowForm(false);
      setEditando(null);
      resetForm();
      carregarAgendamentos();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      alert(`Erro ao salvar agendamento: ${error.message || error}`);
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
        await agendamentoService.deleteAgendamento(token, id);
        carregarAgendamentos();
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
      tipo: 'audiencia',
      processo_id: processoId || '',
      local_evento: '',
      lembrete_1_dia: true,
      lembrete_2_dias: true,
      lembrete_1_semana: false,
      status: 'agendado'
    });
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

  const getTipoIcon = (tipo) => {
    const icons = {
      'audiencia': '⚖️',
      'prazo': '⏰',
      'reuniao': '👥',
      'evento': '📋',
      'outros': '📅'
    };
    return icons[tipo] || '📅';
  };

  return (

    <div className="space-y-6">
      {/* Título e ícone */}
      <div className="flex items-center space-x-3 mb-2">
        <span className="text-3xl">📅</span>
        <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {processoId ? 'Agendamentos do Processo' : 'Meus Agendamentos'}
        </h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditando(null);
            resetForm();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Novo Agendamento
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filtros.tipo}
            onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Todos os tipos</option>
            {tiposEvento.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>

          <select
            value={filtros.status}
            onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Todos os status</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          <input
            type="date"
            value={filtros.data_inicio}
            onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Data início"
          />

          <input
            type="date"
            value={filtros.data_fim}
            onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Data fim"
          />
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editando ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Evento *
                  </label>
                  <select
                    required
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    {tiposEvento.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {!processoId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Processo *
                  </label>
                  <select
                    required
                    value={formData.processo_id}
                    onChange={(e) => setFormData({ ...formData, processo_id: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Selecione um processo</option>
                    {processos.map(processo => (
                      <option key={processo.id} value={processo.id}>
                        {processo.numero_processo} - {processo.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data e Hora *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.data_evento}
                    onChange={(e) => setFormData({ ...formData, data_evento: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                  value={formData.local_evento}
                  onChange={(e) => setFormData({ ...formData, local_evento: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Configurar Lembretes Automáticos
                </label>
                <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                  <p className="text-sm text-blue-700 mb-3">
                    📧 O sistema enviará lembretes automáticos por email nos períodos selecionados antes do evento:
                  </p>
                  <div className="space-y-3">
                    <label className="flex items-center p-2 bg-white rounded border hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.lembrete_1_semana}
                        onChange={(e) => setFormData({ ...formData, lembrete_1_semana: e.target.checked })}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <span className="font-medium text-gray-900">📅 1 semana antes</span>
                        <p className="text-sm text-gray-600">Lembrete enviado 7 dias antes do evento</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-2 bg-white rounded border hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.lembrete_2_dias}
                        onChange={(e) => setFormData({ ...formData, lembrete_2_dias: e.target.checked })}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <span className="font-medium text-gray-900">⏰ 2 dias antes</span>
                        <p className="text-sm text-gray-600">Lembrete enviado 48 horas antes do evento</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-2 bg-white rounded border hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.lembrete_1_dia}
                        onChange={(e) => setFormData({ ...formData, lembrete_1_dia: e.target.checked })}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <span className="font-medium text-gray-900">🔔 1 dia antes</span>
                        <p className="text-sm text-gray-600">Lembrete enviado 24 horas antes do evento</p>
                      </div>
                    </label>
                  </div>
                  
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs text-yellow-700">
                      💡 <strong>Dica:</strong> Para audiências importantes, recomendamos ativar todos os lembretes. 
                      Para prazos rotineiros, apenas 1-2 dias pode ser suficiente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditando(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editando ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Agendamentos */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2">Carregando agendamentos...</p>
        </div>
      ) : agendamentos.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">Nenhum agendamento encontrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {agendamentos.map(agendamento => (
            <div key={agendamento.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{getTipoIcon(agendamento.tipo)}</span>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {agendamento.titulo}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                      {statusOptions.find(s => s.value === agendamento.status)?.label}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📅 {formatarData(agendamento.data_evento)}</p>
                    {agendamento.local && <p>📍 {agendamento.local}</p>}
                    {agendamento.processo && (
                      <p>📋 Processo: {agendamento.processo.numero_processo}</p>
                    )}
                    {agendamento.descricao && (
                      <p className="mt-2">{agendamento.descricao}</p>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {agendamento.lembrete_1_semana && (
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        � 1 semana
                      </span>
                    )}
                    {agendamento.lembrete_2_dias && (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        ⏰ 2 dias
                      </span>
                    )}
                    {agendamento.lembrete_1_dia && (
                      <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        🔔 1 dia
                      </span>
                    )}
                    {!agendamento.lembrete_1_dia && !agendamento.lembrete_2_dias && !agendamento.lembrete_1_semana && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        🔕 Sem lembretes
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(agendamento)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(agendamento.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Excluir"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgendamentoManager;
