import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { apiRequest } from '@/api/apiRequest';
import { useGlobalToast } from '@/contexts/ToastContext';
import { formatDateTime } from '@/utils/commonUtils';
import Button from '@/components/common/Button';

const NotificacoesAdmin = () => {
  const { token, user } = useAuthContext();
  const { showSuccess, showError } = useGlobalToast();
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrar, setMostrar] = useState(false);

  // Verificar se é Admin
  const roleName = user?.role?.nome || user?.role;
  const isAdmin = roleName === 'Admin';

  useEffect(() => {
    if (isAdmin) {
      carregarNotificacoes();
    }
  }, [isAdmin]);

  const carregarNotificacoes = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/api/agendamentos/notificacoes-admin', {
        method: 'GET',
        token
      });
      
      if (response.success) {
        setNotificacoes(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = async (agendamentoId) => {
    try {
      const response = await apiRequest(`/api/agendamentos/${agendamentoId}/marcar-lida`, {
        method: 'POST',
        token
      });
      
      if (response.success) {
        setNotificacoes(prev => prev.filter(n => n.id !== agendamentoId));
        showSuccess('Notificação marcada como lida');
      }
    } catch (error) {
      showError('Erro ao marcar notificação como lida');
    }
  };

  const reenviarConvites = async (agendamentoId) => {
    try {
      const response = await apiRequest(`/api/agendamentos/${agendamentoId}/reenviar-convites`, {
        method: 'POST',
        token
      });
      
      if (response.success) {
        showSuccess('Convites reenviados com sucesso!');
        carregarNotificacoes(); // Recarregar para atualizar status
      } else {
        showError(response.message || 'Erro ao reenviar convites');
      }
    } catch (error) {
      showError('Erro ao reenviar convites');
    }
  };

  if (!isAdmin) {
    return null;
  }

  const notificacoesNaoLidas = notificacoes.filter(n => !n.admin_notificado_lida);

  return (
    <div className="relative">
      {/* Botão de notificações */}
      <button
        onClick={() => setMostrar(!mostrar)}
        className={`relative p-2 rounded-full transition-colors ${
          notificacoesNaoLidas.length > 0
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
        </svg>
        
        {/* Badge de contagem */}
        {notificacoesNaoLidas.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {notificacoesNaoLidas.length > 9 ? '9+' : notificacoesNaoLidas.length}
          </span>
        )}
      </button>

      {/* Dropdown de notificações */}
      {mostrar && (
        <>
          {/* Overlay para fechar */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setMostrar(false)}
          />
          
          {/* Conteúdo das notificações */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-[500px] overflow-hidden">
            {/* Cabeçalho */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  🔔 Notificações Admin
                </h3>
                <button
                  onClick={() => setMostrar(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {notificacoesNaoLidas.length} notificação{notificacoesNaoLidas.length !== 1 ? 'ões' : ''} não lida{notificacoesNaoLidas.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Lista de notificações */}
            <div className="overflow-y-auto max-h-96">
              {loading ? (
                <div className="p-6 text-center text-gray-500">
                  <svg className="w-8 h-8 animate-spin mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Carregando...
                </div>
              ) : notificacoes.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                  </svg>
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notificacoes.map((notificacao) => (
                    <div
                      key={notificacao.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notificacao.admin_notificado_lida ? 'bg-red-50 border-l-4 border-l-red-400' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-800 mb-1">
                            🚨 Rejeições em Agendamento
                          </h4>
                          <p className="text-sm text-gray-700 mb-2">
                            <strong>{notificacao.titulo}</strong> tem rejeições de convidados que precisam de sua atenção.
                          </p>
                          
                          {/* Informações das rejeições */}
                          {notificacao.convidados && (
                            <div className="text-xs text-gray-600 mb-3">
                              {notificacao.convidados
                                .filter(c => c.status === 'recusado')
                                .map((convidado, index) => (
                                  <div key={index} className="bg-gray-100 rounded p-2 mb-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">{convidado.email}</span>
                                      <span className="text-red-600">❌ Recusou</span>
                                    </div>
                                    {convidado.justificativa && (
                                      <p className="text-gray-600 mt-1 italic">
                                        "{convidado.justificativa}"
                                      </p>
                                    )}
                                  </div>
                                ))}
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500 mb-3">
                            📅 {formatDateTime(notificacao.data_inicio)}
                          </div>

                          {/* Ações */}
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => reenviarConvites(notificacao.id)}
                              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                            >
                              📧 Reenviar Convites
                            </Button>
                            <Button
                              onClick={() => marcarComoLida(notificacao.id)}
                              className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                            >
                              ✅ Marcar como Lida
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rodapé */}
            {notificacoes.length > 0 && (
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <Button
                  onClick={() => {
                    notificacoes.forEach(n => marcarComoLida(n.id));
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Marcar todas como lidas
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificacoesAdmin;
