import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { apiRequest } from '@/api/apiRequest';
import { useAuthContext } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';
import { formatDate } from '@/utils/commonUtils';

const AgendamentosProcesso = ({ processoId }) => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState(null);
  const { token } = useAuthContext();
  const [formData, setFormData] = useState({
    start: '',
    end: '',
    summary: '',
    description: '',
    location: ''
  });

  // Carregar agendamentos do processo
  const loadAgendamentos = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/api/processos/${processoId}/agendamentos-processo`, {
        method: 'GET',
        token
      });
      
      if (response.success) {
        setAgendamentos(response.data.agendamentos || []);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (processoId) {
      loadAgendamentos();
    }
  }, [processoId]);

  // Abrir modal para criar/editar
  const openModal = (agendamento = null) => {
    if (agendamento) {
      setEditingAgendamento(agendamento);
      setFormData({
        start: new Date(agendamento.start).toISOString().slice(0, 16),
        end: new Date(agendamento.end).toISOString().slice(0, 16),
        summary: agendamento.summary || '',
        description: agendamento.description || '',
        location: agendamento.location || ''
      });
    } else {
      setEditingAgendamento(null);
      setFormData({
        start: '',
        end: '',
        summary: '',
        description: '',
        location: ''
      });
    }
    setShowModal(true);
  };

  // Fechar modal
  const closeModal = () => {
    setShowModal(false);
    setEditingAgendamento(null);
    setFormData({
      start: '',
      end: '',
      summary: '',
      description: '',
      location: ''
    });
  };

  // Salvar agendamento
  const saveAgendamento = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const url = editingAgendamento 
        ? `/api/agendamentos-processo/${editingAgendamento.id}`
        : `/api/processos/${processoId}/agendamentos-processo`;

      const method = editingAgendamento ? 'PUT' : 'POST';

      // Corrigir formato das datas para ISO completo
      const dataToSend = {
        ...formData,
        start: formData.start ? new Date(formData.start).toISOString() : '',
        end: formData.end ? new Date(formData.end).toISOString() : ''
      };

      const response = await apiRequest(url, {
        method,
        token,
        data: dataToSend
      });

      if (response.success) {
        await loadAgendamentos();
        closeModal();
        alert(editingAgendamento ? 'Agendamento atualizado!' : 'Agendamento criado!');
      } else {
        alert(`Erro: ${response.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      alert('Erro ao salvar agendamento');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar agendamento
  const cancelAgendamento = async (id) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return;
    }

    try {
      const response = await apiRequest(`/api/agendamentos-processo/${id}`, {
        method: 'DELETE',
        token
      });

      if (response.success) {
        await loadAgendamentos();
        alert('Agendamento cancelado!');
      } else {
        alert(`Erro: ${response.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      alert('Erro ao cancelar agendamento');
    }
  };

  // Sincronizar com Google Calendar
  const syncAgendamento = async (id) => {
    try {
      const response = await apiRequest(`/api/agendamentos-processo/${id}/sync`, {
        method: 'POST',
        token
      });

      if (response.success) {
        await loadAgendamentos();
        alert('Agendamento sincronizado com Google Calendar!');
      } else {
        alert(`Erro: ${response.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao sincronizar agendamento:', error);
      alert('Erro ao sincronizar agendamento');
    }
  };

  // Formatação de data
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Agendamentos do Processo</h2>
        <Button
          onClick={() => openModal()}
          variant="primary"
          disabled={loading}
        >
          <Plus size={20} style={{ marginRight: '8px' }} />
          Novo Agendamento
        </Button>
      </div>

      {loading && !agendamentos.length && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando agendamentos...</p>
        </div>
      )}

      {!loading && agendamentos.length === 0 && (
        <div className="text-center py-8">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento encontrado</h3>
          <p className="text-gray-600">Clique em "Novo Agendamento" para criar o primeiro.</p>
        </div>
      )}

      <div className="space-y-4">
        {agendamentos.map((agendamento) => (
          <div key={agendamento.id} className="bg-white rounded-lg shadow border p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {agendamento.summary || 'Agendamento NPJ'}
                </h3>
                {getStatusBadge(agendamento.status)}
              </div>
              <div className="flex gap-2">
                {agendamento.status === 'pendente' && (
                  <button
                    onClick={() => syncAgendamento(agendamento.id)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Sincronizar com Google Calendar"
                  >
                    <ExternalLink size={20} />
                  </button>
                )}
                {agendamento.google_event_id && (
                  <a
                    href={`https://calendar.google.com/calendar/event?eid=${agendamento.google_event_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800"
                    title="Ver no Google Calendar"
                  >
                    <ExternalLink size={20} />
                  </a>
                )}
                <button
                  onClick={() => openModal(agendamento)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
                  title="Editar"
                >
                  <Edit size={20} className="text-white" />
                </button>
                <button
                  onClick={() => cancelAgendamento(agendamento.id)}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors"
                  title="Cancelar"
                >
                  <Trash2 size={20} className="text-white" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-gray-600">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>
                  {formatDateTime(agendamento.start)} até {formatDateTime(agendamento.end)}
                </span>
              </div>
              {agendamento.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{agendamento.location}</span>
                </div>
              )}
              {agendamento.description && (
                <p className="mt-2">{agendamento.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal para criar/editar agendamento */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h3>

            <form onSubmit={saveAgendamento} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite o título do agendamento"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Início *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start}
                    onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fim *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end}
                    onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Local
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite o local do agendamento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Digite uma descrição para o agendamento"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendamentosProcesso;
