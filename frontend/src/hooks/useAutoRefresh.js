// Hook para auto-refresh pós-CRUD - Sistema NPJ
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook para implementar auto-refresh automático com intervalos e após operações CRUD
 * @param {number} interval - Intervalo em milissegundos (padrão: 30000 = 30s)
 * @param {boolean} enabled - Se o auto-refresh está habilitado (padrão: true)
 */
export function useAutoRefresh(interval = 30000, enabled = true) {
  const queryClient = useQueryClient();
  const intervalRef = useRef(null);
  const isActiveRef = useRef(true);

  // Função principal para invalidar cache e atualizar dados
  const refreshData = useCallback((queryKeys) => {
    const defaultQueries = ['processos', 'usuarios', 'agendamentos', 'dashboard', 'notificacoes', 'arquivos'];
    // Garante que queryKeys seja sempre um array
    const safeQueryKeys = Array.isArray(queryKeys) ? queryKeys : (queryKeys ? [queryKeys] : []);
    const allQueries = [...defaultQueries, ...safeQueryKeys];

    setTimeout(() => {
      allQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });
      // Removido console.log
    }, 500);
  }, [queryClient]);

  // Função para iniciar auto-refresh com intervalo
  const startAutoRefresh = useCallback(() => {
    if (!enabled) return;

    // Limpar interval anterior se existir
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Executar refresh imediatamente ao iniciar
    if (isActiveRef.current) {
      // Removido console.log
      refreshData();
    }

    // Configurar interval para refresh automático
    intervalRef.current = setInterval(() => {
      if (isActiveRef.current && document.visibilityState === 'visible') {
        console.log(`🔄 Auto-refresh executado (${interval/1000}s)`);
        refreshData();
      }
    }, interval);

  // Removido console.log
  }, [refreshData, interval, enabled]);

  // Função para parar auto-refresh
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
  // Removido console.log
    }
  }, []);

  // Configurar auto-refresh quando o componente montar
  useEffect(() => {
    isActiveRef.current = true;
    startAutoRefresh();

    // Pausar refresh quando a página não estiver visível
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
  // Removido console.log
        isActiveRef.current = true;
        startAutoRefresh();
      } else {
  // Removido console.log
        isActiveRef.current = false;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      isActiveRef.current = false;
      stopAutoRefresh();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startAutoRefresh, stopAutoRefresh]);

  // Ações específicas para diferentes operações CRUD
  const afterCreate = useCallback((entity, specificQueries = []) => {
    refreshData(specificQueries);
  // Removido console.log
  }, [refreshData]);

  const afterUpdate = useCallback((entity, specificQueries = []) => {
    refreshData(specificQueries);
  // Removido console.log
  }, [refreshData]);

  const afterDelete = useCallback((entity, specificQueries = []) => {
    refreshData(specificQueries);
  // Removido console.log
  }, [refreshData]);

  const manualRefresh = useCallback((specificQueries = []) => {
    refreshData(specificQueries);
  // Removido console.log
  }, [refreshData]);

  return {
    refreshData,
    afterCreate,
    afterUpdate,
    afterDelete,
    manualRefresh,
    startAutoRefresh,
    stopAutoRefresh,
    isActive: isActiveRef.current
  };
}

// Hook para auto-refresh específico de processos
export function useProcessoAutoRefresh(interval = 30000) {
  const { afterCreate, afterUpdate, afterDelete, manualRefresh } = useAutoRefresh(interval);
  return {
    afterCreateProcesso: () => afterCreate('processo', ['processos']),
    afterUpdateProcesso: () => afterUpdate('processo', ['processos']),
    afterDeleteProcesso: () => afterDelete('processo', ['processos']),
    afterConcluirProcesso: () => afterUpdate('processo', ['processos']),
    afterReabrirProcesso: () => afterUpdate('processo', ['processos']),
    refreshProcessos: () => manualRefresh(['processos'])
  };
}

// Hook para auto-refresh específico de usuários
export function useUsuarioAutoRefresh(interval = 30000) {
  const { afterCreate, afterUpdate, afterDelete, manualRefresh } = useAutoRefresh(interval);
  return {
    afterCreateUsuario: () => afterCreate('usuário', ['usuarios']),
    afterUpdateUsuario: () => afterUpdate('usuário', ['usuarios']),
    afterDeleteUsuario: () => afterDelete('usuário', ['usuarios']),
    afterSoftDeleteUsuario: () => afterUpdate('usuário', ['usuarios']),
    afterReactivateUsuario: () => afterUpdate('usuário', ['usuarios']),
    refreshUsuarios: () => manualRefresh(['usuarios'])
  };
}

// Hook para auto-refresh específico de agendamentos
export function useAgendamentoAutoRefresh(interval = 30000) {
  const { afterCreate, afterUpdate, afterDelete, manualRefresh } = useAutoRefresh(interval);
  return {
    afterCreateAgendamento: () => afterCreate('agendamento', ['agendamentos']),
    afterUpdateAgendamento: () => afterUpdate('agendamento', ['agendamentos']),
    afterDeleteAgendamento: () => afterDelete('agendamento', ['agendamentos']),
    afterSincronizarGoogle: () => afterUpdate('agendamento', ['agendamentos']),
    refreshAgendamentos: () => manualRefresh(['agendamentos'])
  };
}

// Hook para auto-refresh específico de arquivos
export function useArquivoAutoRefresh(interval = 30000) {
  const { afterCreate, afterUpdate, afterDelete, manualRefresh } = useAutoRefresh(interval);
  return {
    afterUploadArquivo: () => afterCreate('arquivo', ['arquivos']),
    afterDeleteArquivo: () => afterDelete('arquivo', ['arquivos']),
    refreshArquivos: () => manualRefresh(['arquivos'])
  };
}

// Hook específico para notificações
export function useNotificacaoAutoRefresh(interval = 30000) {
  const { afterCreate, afterUpdate, afterDelete, manualRefresh } = useAutoRefresh(interval);
  return {
    afterMarcarLida: () => afterUpdate('notificacao', ['notificacoes']),
    afterMarcarTodasLidas: () => afterUpdate('notificacao', ['notificacoes']),
    afterDeleteNotificacao: () => afterDelete('notificacao', ['notificacoes']),
    refreshNotificacoes: () => manualRefresh(['notificacoes'])
  };
}

// Hook específico para dashboard
export function useDashboardAutoRefresh(interval = 30000) {
  const { refreshData, manualRefresh } = useAutoRefresh(interval);
  return {
    afterUpdateDashboard: () => refreshData(['dashboard', 'estatisticas', 'processos', 'usuarios', 'agendamentos']),
    refreshDashboard: () => manualRefresh(['dashboard'])
  };
}

export default useAutoRefresh;
