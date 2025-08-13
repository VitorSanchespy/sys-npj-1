import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';
import { apiRequest } from '@/api/apiRequest';
import { useAuthContext } from '@/contexts/AuthContext';
import { useGoogleCalendar } from '@/contexts/GoogleCalendarContext';
import Button from '@/components/common/Button';

const ProcessoAgendamentosSlim = ({ processoId }) => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuthContext();
  const { isConnected, connectCalendar, loading: calendarLoading } = useGoogleCalendar();

  // Carregar agendamentos do processo
  const loadAgendamentos = async () => {
    if (!isConnected || !processoId) return;

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
    if (isConnected && processoId) {
      loadAgendamentos();
    }
  }, [isConnected, processoId]);

  // Formatação de data/hora
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Se não conectado ao Google Calendar
  if (!isConnected) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 text-center border border-blue-200">
        <Calendar size={48} className="mx-auto text-blue-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          Conecte seu Google Calendar
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Para visualizar e gerenciar os agendamentos deste processo, conecte sua conta do Google Calendar.
        </p>
        <Button
          onClick={connectCalendar}
          disabled={calendarLoading}
          variant="primary"
          className="px-8 py-3"
        >
          {calendarLoading ? 'Conectando...' : 'Conectar Google Calendar'}
        </Button>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-4">
          <Calendar size={24} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Agendamentos</h3>
        </div>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Nenhum agendamento encontrado
  if (agendamentos.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-4">
          <Calendar size={24} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Agendamentos</h3>
        </div>
        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Calendar size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600">Nenhum agendamento encontrado para este processo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Calendar size={24} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Agendamentos</h3>
        </div>
        <span className="text-sm text-gray-500">
          {agendamentos.length} evento{agendamentos.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2">
        {agendamentos.map((agendamento) => (
          <div
            key={agendamento.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* Linha 1: Título e Status */}
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-900 text-sm leading-tight">
                {agendamento.summary || 'Agendamento NPJ'}
              </h4>
              <div className="flex items-center gap-2 ml-3">
                {/* Badge de tipo */}
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  {agendamento.tipo_evento || 'Reunião'}
                </span>
                {/* Link para Google Calendar se disponível */}
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
              </div>
            </div>

            {/* Linha 2: Data e Hora */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-1">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>Início: {formatDateTime(agendamento.start)}</span>
              </div>
            </div>

            {/* Linha 3: Data fim */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>Fim: {formatDateTime(agendamento.end)}</span>
              </div>
            </div>

            {/* Linha 4: Local (se disponível) */}
            {agendamento.location && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin size={14} />
                <span className="truncate">{agendamento.location}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Link para página completa de agendamentos */}
      <div className="pt-3 border-t border-gray-200">
        <Button
          onClick={() => window.location.href = '/agendamentos'}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Ver todos os agendamentos
        </Button>
      </div>
    </div>
  );
};

export default ProcessoAgendamentosSlim;
