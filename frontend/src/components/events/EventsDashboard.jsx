import React, { useState, useEffect } from 'react';
import { eventService } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ChartBarIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const EventStatsCard = ({ title, value, icon: Icon, color = 'blue', description }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200'
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]} border`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {value}
          </p>
          {description && (
            <p className="text-sm text-gray-600 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const EventsDashboard = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas
      const statsResponse = await eventService.getEventStats(token);
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      // Carregar eventos recentes
      const eventsResponse = await eventService.getEvents({ limit: 5 }, token);
      if (eventsResponse.success) {
        setRecentEvents(eventsResponse.data);
      }

      setError(null);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status) => {
    const colors = {
      requested: 'text-yellow-600 bg-yellow-100',
      approved: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100',
      canceled: 'text-gray-600 bg-gray-100',
      completed: 'text-blue-600 bg-blue-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status) => {
    const labels = {
      requested: 'Solicitado',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      canceled: 'Cancelado',
      completed: 'Concluído'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ChartBarIcon className="w-8 h-8 mr-3 text-blue-600" />
            Dashboard de Eventos
          </h1>
          <p className="mt-2 text-gray-600">
            Visão geral das suas solicitações e estatísticas de eventos
          </p>
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

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <EventStatsCard
              title="Total de Eventos"
              value={stats.total}
              icon={CalendarIcon}
              color="blue"
              description="Todos os eventos criados"
            />
            <EventStatsCard
              title="Aprovados"
              value={stats.by_status?.approved || 0}
              icon={CheckCircleIcon}
              color="green"
              description="Eventos aprovados e ativos"
            />
            <EventStatsCard
              title="Pendentes"
              value={stats.by_status?.requested || 0}
              icon={ClockIcon}
              color="yellow"
              description="Aguardando aprovação"
            />
            <EventStatsCard
              title="Rejeitados"
              value={stats.by_status?.rejected || 0}
              icon={XCircleIcon}
              color="red"
              description="Eventos não aprovados"
            />
          </div>
        )}

        {/* Recent Events */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Eventos Recentes
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Últimos eventos criados ou atualizados
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {recentEvents.length === 0 ? (
              <div className="p-6 text-center">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Nenhum evento encontrado
                </h3>
                <p className="text-gray-500">
                  Crie seu primeiro evento para começar!
                </p>
              </div>
            ) : (
              recentEvents.map((event) => (
                <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {event.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {getStatusLabel(event.status)}
                        </span>
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span>
                          Início: {formatDate(event.start_at)}
                        </span>
                        <span>
                          Solicitante: {event.requester?.nome || 'N/A'}
                        </span>
                        {event.participants && event.participants.length > 0 && (
                          <span>
                            {event.participants.length} participante(s)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 text-center">
          <div className="inline-flex rounded-lg shadow">
            <a
              href="/events"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
            >
              <CalendarIcon className="w-5 h-5 mr-2" />
              Ver Todos os Eventos
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsDashboard;
