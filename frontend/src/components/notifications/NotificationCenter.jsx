import React, { useState, useEffect } from 'react';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NotificationCenter = () => {
  const { 
    notifications, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    getNotificationsByType,
    getUnreadNotifications,
    loadNotifications,
    loadUnreadCount
  } = useNotificationContext();
  
  const [filter, setFilter] = useState('todas'); // todas, nao_lidas, agendamentos, autenticacao, processos
  const [sortBy, setSortBy] = useState('data_criacao'); // data_criacao, tipo, lida

  // Filtrar notificações
  const getFilteredNotifications = () => {
    let filtered = [...notifications];

    switch (filter) {
      case 'nao_lidas':
        filtered = notifications.filter(n => {
          const isRead = n.lida === true || n.status === 'lido' || n.data_leitura;
          return !isRead;
        });
        break;
      case 'agendamentos':
        filtered = notifications.filter(n => n.tipo.includes('agendamento'));
        break;
      case 'autenticacao':
        filtered = notifications.filter(n => 
          n.tipo.includes('login') || n.tipo.includes('senha') || n.tipo.includes('email')
        );
        break;
      case 'processos':
        filtered = notifications.filter(n => n.tipo.includes('processo'));
        break;
      case 'usuarios':
        filtered = notifications.filter(n => n.tipo.includes('usuario'));
        break;
      default:
        // todas
        break;
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'tipo':
          return a.tipo.localeCompare(b.tipo);
        case 'lida':
          return (a.lida ? 1 : 0) - (b.lida ? 1 : 0);
        default:
          return new Date(b.data_criacao) - new Date(a.data_criacao);
      }
    });

    return filtered;
  };

  // Obter estatísticas
  const getStats = () => {
    const total = notifications.length;
    const unread = notifications.filter(n => {
      const isRead = n.lida === true || n.status === 'lido' || n.data_leitura;
      return !isRead;
    }).length;
    const agendamentos = getNotificationsByType('agendamento').length;
    const autenticacao = notifications.filter(n => 
      n.tipo.includes('login') || n.tipo.includes('senha')
    ).length;
    
    return { total, unread, agendamentos, autenticacao };
  };

  // Obter ícone do tipo
  const getTypeIcon = (tipo) => {
    if (tipo.includes('agendamento')) return '📅';
    if (tipo.includes('login') || tipo.includes('senha')) return '🔐';
    if (tipo.includes('processo')) return '📋';
    if (tipo.includes('usuario')) return '👥';
    if (tipo.includes('arquivo')) return '📎';
    return '🔔';
  };

  // Formatar data
  const formatDate = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'Data inválida';
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const stats = getStats();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Carregando notificações...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Cabeçalho */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            🔔 Central de Notificações
          </h2>
          {stats.unread > 0 && (
            <button
              onClick={async () => {
                await markAllAsRead();
                // Forçar atualização visual
                await loadNotifications();
                await loadUnreadCount();
              }}
              style={{
                background: '#007bff',
                color: 'white',
                border: '1px solid #007bff',
                borderRadius: '6px',
                padding: '8px 16px',
                fontWeight: 500,
                fontSize: '14px',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
            >
              Marcar todas como lidas
            </button>
          )}
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
            <div className="text-sm text-blue-600">Não lidas</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.agendamentos}</div>
            <div className="text-sm text-green-600">Agendamentos</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.autenticacao}</div>
            <div className="text-sm text-yellow-600">Autenticação</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filtrar:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas</option>
              <option value="nao_lidas">Não lidas</option>
              <option value="agendamentos">Agendamentos</option>
              <option value="autenticacao">Autenticação</option>
              <option value="processos">Processos</option>
              <option value="usuarios">Usuários</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Ordenar:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="data_criacao">Data (mais recente)</option>
              <option value="tipo">Tipo</option>
              <option value="lida">Status (não lidas primeiro)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de notificações */}
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma notificação encontrada
            </h3>
            <p className="text-gray-500">
              {filter === 'todas' 
                ? 'Você não possui notificações ainda.'
                : `Nenhuma notificação encontrada para o filtro "${filter}".`
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                !(notification.lida === true || notification.status === 'lido' || notification.data_leitura) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => {
                const isRead = notification.lida === true || notification.status === 'lido' || notification.data_leitura;
                if (!isRead) markAsRead(notification.id);
              }}
            >
              <div className="flex items-start space-x-4">
                {/* Ícone */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                    {getTypeIcon(notification.tipo)}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-medium ${
                      !(notification.lida === true || notification.status === 'lido' || notification.data_leitura) ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {notification.titulo}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {!(notification.lida === true || notification.status === 'lido' || notification.data_leitura) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Nova
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {formatDate(notification.data_criacao)}
                      </span>
                    </div>
                  </div>
                  
                  <p className={`mt-1 text-sm ${
                    !(notification.lida === true || notification.status === 'lido' || notification.data_leitura) ? 'text-gray-700' : 'text-gray-500'
                  }`}>
                    {notification.mensagem}
                  </p>

                  {/* Metadados */}
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-gray-300 rounded-full mr-1"></span>
                      {notification.tipo.replace(/_/g, ' ')}
                    </span>
                    {notification.data_leitura && (
                      <span>Lida em {formatDate(notification.data_leitura)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
