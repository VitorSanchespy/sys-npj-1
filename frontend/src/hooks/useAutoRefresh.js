// Hook para auto-refresh pós-CRUD - Sistema NPJ
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Hook para implementar auto-refresh automático após operações CRUD
 */
export function useAutoRefresh() {
  const queryClient = useQueryClient();

  // Função principal para invalidar cache e atualizar dados
  const refreshData = useCallback((queryKeys = []) => {
    const defaultQueries = ['processos', 'usuarios', 'agendamentos', 'dashboard', 'notificacoes'];
    const allQueries = [...defaultQueries, ...queryKeys];
    setTimeout(() => {
      allQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });
      console.log('🔄 Dados atualizados automaticamente:', allQueries.join(', '));
    }, 500);
  }, [queryClient]);

  // Ações específicas para diferentes operações CRUD
  const afterCreate = useCallback(entity => {
    refreshData();
    console.log(`✅ ${entity} criado - dados atualizados automaticamente`);
  }, [refreshData]);

  const afterUpdate = useCallback(entity => {
    refreshData();
    console.log(`📝 ${entity} atualizado - dados atualizados automaticamente`);
  }, [refreshData]);

  const afterDelete = useCallback(entity => {
    refreshData();
    console.log(`🗑️ ${entity} excluído - dados atualizados automaticamente`);
  }, [refreshData]);

  const manualRefresh = useCallback(() => {
    refreshData();
    console.log('🔄 Atualização manual executada');
  }, [refreshData]);

  return {
    refreshData,
    afterCreate,
    afterUpdate,
    afterDelete,
    manualRefresh
  };
}

// Hook para auto-refresh específico de processos
export function useProcessoAutoRefresh() {
  const { afterCreate, afterUpdate, afterDelete, manualRefresh } = useAutoRefresh();
  return {
    afterCreateProcesso: () => afterCreate('processo'),
    afterUpdateProcesso: () => afterUpdate('processo'),
    afterDeleteProcesso: () => afterDelete('processo'),
    afterConcluirProcesso: () => afterUpdate('processo'),
    afterReabrirProcesso: () => afterUpdate('processo'),
    refreshProcessos: manualRefresh
  };
}

// Hook para auto-refresh específico de usuários
export function useUsuarioAutoRefresh() {
  const { afterCreate, afterUpdate, afterDelete, manualRefresh } = useAutoRefresh();
  return {
    afterCreateUsuario: () => afterCreate('usuário'),
    afterUpdateUsuario: () => afterUpdate('usuário'),
    afterDeleteUsuario: () => afterDelete('usuário'),
    afterSoftDeleteUsuario: () => afterUpdate('usuário'),
    afterReactivateUsuario: () => afterUpdate('usuário'),
    refreshUsuarios: manualRefresh
  };
}

// Hook para auto-refresh específico de agendamentos
export function useAgendamentoAutoRefresh() {
  const { afterCreate, afterUpdate, afterDelete, manualRefresh } = useAutoRefresh();
  return {
    afterCreateAgendamento: () => afterCreate('agendamento'),
    afterUpdateAgendamento: () => afterUpdate('agendamento'),
    afterDeleteAgendamento: () => afterDelete('agendamento'),
    afterSincronizarGoogle: () => afterUpdate('agendamento'),
    refreshAgendamentos: manualRefresh
  };
}

// Hook para auto-refresh específico de arquivos
export function useArquivoAutoRefresh() {
  const { afterCreate, afterUpdate, afterDelete, manualRefresh } = useAutoRefresh();
  return {
    afterUploadArquivo: () => afterCreate('arquivo'),
    afterDeleteArquivo: () => afterDelete('arquivo'),
    refreshArquivos: manualRefresh
  };
}

// Hook específico para notificações
export function useNotificacaoAutoRefresh() {
  const { afterCreate, afterUpdate, afterDelete, manualRefresh } = useAutoRefresh();
  return {
    afterMarcarLida: () => afterUpdate('notificacao'),
    afterMarcarTodasLidas: () => afterUpdate('notificacao'),
    afterDeleteNotificacao: () => afterDelete('notificacao'),
    refreshNotificacoes: manualRefresh
  };
}

// Hook específico para dashboard
export function useDashboardAutoRefresh() {
  const { refreshData } = useAutoRefresh();
  return {
    afterUpdateDashboard: () => refreshData(['dashboard', 'estatisticas', 'processos', 'usuarios', 'agendamentos'])
  };
}

export default useAutoRefresh;
