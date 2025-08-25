import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { agendamentoService } from '@/api/services';
import { formatDateTime } from '@/utils/commonUtils';
import Loader from '@/components/common/Loader';
import Button from '@/components/common/Button';

const AgendamentoLogs = ({ agendamentoId, mostrar, onFechar }) => {
  const { token, user } = useAuthContext();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verificar se o usuário pode ver logs (Admin ou Professor)
  const roleName = user?.role?.nome || user?.role;
  const podeVerLogs = roleName === 'Admin' || roleName === 'Professor';

  useEffect(() => {
    if (mostrar && agendamentoId && podeVerLogs) {
      carregarLogs();
    }
  }, [mostrar, agendamentoId, podeVerLogs]);

  const carregarLogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await agendamentoService.getLogsAgendamento(token, agendamentoId);
      
      if (response.success) {
        setLogs(response.data || []);
      } else {
        setError(response.message || 'Erro ao carregar logs');
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      setError('Erro interno do servidor');
    } finally {
      setLoading(false);
    }
  };

  const getIconeAcao = (acao) => {
    switch (acao) {
      case 'criacao': return '✨';
      case 'aprovacao': return '✅';
      case 'recusa': return '❌';
      case 'aceite_convite': return '👍';
      case 'recusa_convite': return '👎';
      case 'cancelamento': return '🗑️';
      case 'expiracao': return '⏰';
      case 'reenvio_convites': return '📧';
      default: return '📝';
    }
  };

  const getCorAcao = (acao) => {
    switch (acao) {
      case 'criacao': return 'text-blue-600 bg-blue-50';
      case 'aprovacao': return 'text-green-600 bg-green-50';
      case 'recusa': return 'text-red-600 bg-red-50';
      case 'aceite_convite': return 'text-green-600 bg-green-50';
      case 'recusa_convite': return 'text-orange-600 bg-orange-50';
      case 'cancelamento': return 'text-red-600 bg-red-50';
      case 'expiracao': return 'text-yellow-600 bg-yellow-50';
      case 'reenvio_convites': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!mostrar || !podeVerLogs) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd"/>
              </svg>
              <h3 className="text-lg font-semibold text-gray-800">
                📊 Logs de Auditoria - Agendamento #{agendamentoId}
              </h3>
            </div>
            <Button
              onClick={onFechar}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="p-8 text-center">
              <Loader message="Carregando logs..." />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-600 text-lg mb-4">❌ {error}</div>
              <Button
                onClick={carregarLogs}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                🔄 Tentar Novamente
              </Button>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd"/>
              </svg>
              <p className="text-lg">Nenhum log encontrado</p>
              <p className="text-sm">Este agendamento ainda não possui histórico de ações</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    {/* Ícone da ação */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getCorAcao(log.acao)}`}>
                      {getIconeAcao(log.acao)}
                    </div>

                    {/* Conteúdo do log */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800 capitalize">
                          {log.acao.replace('_', ' ')}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(log.created_at)}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-2">
                        {log.descricao}
                      </p>

                      {/* Informações do usuário */}
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                        </svg>
                        <span>
                          {log.usuario_nome || 'Sistema'} 
                          {log.usuario_email && ` (${log.usuario_email})`}
                        </span>
                        {log.ip_address && (
                          <span className="ml-4 text-gray-400">
                            📍 {log.ip_address}
                          </span>
                        )}
                      </div>

                      {/* Detalhes adicionais */}
                      {log.detalhes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Detalhes:</strong> {log.detalhes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              📈 Total de {logs.length} ação{logs.length !== 1 ? 'ões' : ''} registrada{logs.length !== 1 ? 's' : ''}
            </p>
            <Button
              onClick={onFechar}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendamentoLogs;
