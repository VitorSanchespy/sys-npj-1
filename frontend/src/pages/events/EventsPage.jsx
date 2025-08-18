import React, { useState, useEffect } from 'react';
import { eventService } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import CreateEventModal from '../../components/events/CreateEventModal';
import { 
  CalendarIcon, 
  PlusIcon, 
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const EventsPage = () => {
  const { user, token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Status colors
  const statusColors = {
    requested: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    canceled: 'bg-gray-100 text-gray-800 border-gray-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  // Status icons
  const statusIcons = {
    requested: <ClockIcon className="w-4 h-4" />,
    approved: <CheckCircleIcon className="w-4 h-4" />,
    rejected: <XCircleIcon className="w-4 h-4" />,
    canceled: <XCircleIcon className="w-4 h-4" />,
    completed: <CheckCircleIcon className="w-4 h-4" />
  };

  // Status labels
  const statusLabels = {
    requested: 'Solicitado',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    canceled: 'Cancelado',
    completed: 'Concluído'
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const filters = filter !== 'all' ? { status: filter } : {};
      const response = await eventService.getEvents(filters, token);
      
      if (response.success) {
        setEvents(response.data);
        setError(null);
      } else {
        setError(response.message || 'Erro ao carregar eventos');
      }
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
      setError('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadEvents();
    }
  }, [token, filter]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const canApproveReject = () => {
    return user && (user.role === 'Admin' || user.role === 'Professor');
  };

  const handleApprove = async (eventId) => {
    try {
      const response = await eventService.approveEvent(eventId, token);
      if (response.success) {
        loadEvents(); // Recarregar lista
      } else {
        setError(response.message || 'Erro ao aprovar evento');
      }
    } catch (err) {
      console.error('Erro ao aprovar evento:', err);
      setError('Erro ao aprovar evento');
    }
  };

  const handleReject = async (eventId, reason) => {
    try {
      const response = await eventService.rejectEvent(eventId, reason, token);
      if (response.success) {
        loadEvents(); // Recarregar lista
      } else {
        setError(response.message || 'Erro ao rejeitar evento');
      }
    } catch (err) {
      console.error('Erro ao rejeitar evento:', err);
      setError('Erro ao rejeitar evento');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <CalendarIcon className="w-8 h-8 mr-3 text-blue-600" />
                Sistema de Eventos
              </h1>
              <p className="mt-2 text-gray-600">
                Gerencie suas solicitações de eventos e aprovações
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Novo Evento
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-4">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filtrar por status:</span>
            <div className="flex space-x-2">
              {['all', 'requested', 'approved', 'rejected', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'Todos' : statusLabels[status]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum evento encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                {filter === 'all' 
                  ? 'Você ainda não tem eventos. Crie seu primeiro evento!'
                  : `Nenhum evento com status "${statusLabels[filter]}" encontrado.`
                }
              </p>
              {filter === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Criar Primeiro Evento
                </button>
              )}
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {event.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[event.status]}`}>
                          {statusIcons[event.status]}
                          <span className="ml-1">{statusLabels[event.status]}</span>
                        </span>
                      </div>
                      
                      {event.description && (
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Início:</span> {formatDate(event.start_at)}
                        </div>
                        <div>
                          <span className="font-medium">Fim:</span> {formatDate(event.end_at)}
                        </div>
                        <div>
                          <span className="font-medium">Solicitante:</span> {event.requester?.nome || 'N/A'}
                        </div>
                        {event.participants && event.participants.length > 0 && (
                          <div className="flex items-center">
                            <UserGroupIcon className="w-4 h-4 mr-1" />
                            <span className="font-medium">Participantes:</span> {event.participants.length}
                          </div>
                        )}
                      </div>

                      {event.rejection_reason && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-800">
                            <span className="font-medium">Motivo da rejeição:</span> {event.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {canApproveReject() && event.status === 'requested' && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-3">
                      <button
                        onClick={() => handleApprove(event.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Motivo da rejeição:');
                          if (reason) handleReject(event.id, reason);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                      >
                        <XCircleIcon className="w-4 h-4 mr-1" />
                        Rejeitar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={loadEvents}
      />
    </div>
  );
};

export default EventsPage;
