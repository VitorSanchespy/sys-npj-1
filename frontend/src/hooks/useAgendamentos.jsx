import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agendamentoService } from '../api/services';
import { useAuthContext } from '../contexts/AuthContext';

// Hook para listar agendamentos com filtros
export function useAgendamentos(filtros = {}) {
  const { token } = useAuthContext();
  
  return useQuery({
    queryKey: ['agendamentos', filtros],
    queryFn: async () => {
      if (!token) throw new Error('Token não disponível');
      return await agendamentoService.listAgendamentos(token, filtros);
    },
    enabled: !!token,
    staleTime: 30 * 1000, // 30 segundos
    cacheTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 30 * 1000, // Atualiza a cada 30 segundos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

// Hook para listar agendamentos do usuário
export function useAgendamentosUsuario() {
  const { token } = useAuthContext();
  
  return useQuery({
    queryKey: ['agendamentos', 'usuario'],
    queryFn: async () => {
      if (!token) throw new Error('Token não disponível');
      return await agendamentoService.listAgendamentosUsuario(token);
    },
    enabled: !!token,
    staleTime: 1 * 60 * 1000, // 1 minuto
    cacheTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
  });
}

// Hook para obter agendamento por ID
export function useAgendamento(id) {
  const { token } = useAuthContext();
  
  return useQuery({
    queryKey: ['agendamentos', id],
    queryFn: async () => {
      if (!token || !id) throw new Error('Token ou ID não disponível');
      const response = await agendamentoService.getAgendamentoById(token, id);
      return response.success ? response.agendamento : response;
    },
    enabled: !!token && !!id,
    staleTime: 30 * 1000, // 30 segundos
    cacheTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para obter estatísticas de agendamentos
export function useEstatisticasAgendamentos() {
  const { token } = useAuthContext();
  
  return useQuery({
    queryKey: ['agendamentos', 'estatisticas'],
    queryFn: async () => {
      if (!token) throw new Error('Token não disponível');
      const response = await agendamentoService.getEstatisticas(token);
      return response.success ? response.estatisticas : response;
    },
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutos
    cacheTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para verificar conexão Google Calendar
export function useConnectionStatus() {
  const { token } = useAuthContext();
  
  return useQuery({
    queryKey: ['agendamentos', 'conexao'],
    queryFn: async () => {
      if (!token) throw new Error('Token não disponível');
      return await agendamentoService.checkConnection(token);
    },
    enabled: !!token,
    staleTime: 1 * 60 * 1000, // 1 minuto
    cacheTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para criar agendamento
export function useCreateAgendamento() {
  const { token } = useAuthContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (agendamentoData) => {
      if (!token) throw new Error('Token não disponível');
      return await agendamentoService.createAgendamento(token, agendamentoData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      window.location.reload();
    },
    onError: (error) => {
      console.error('❌ Erro ao criar agendamento:', error);
    }
  });
}

// Hook para atualizar agendamento
export function useUpdateAgendamento() {
  const { token } = useAuthContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, agendamentoData }) => {
      if (!token) throw new Error('Token não disponível');
      return await agendamentoService.updateAgendamento(token, id, agendamentoData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      window.location.reload();
    },
    onError: (error) => {
      console.error('❌ Erro ao atualizar agendamento:', error);
    }
  });
}

// Hook para deletar agendamento
export function useDeleteAgendamento() {
  const { token } = useAuthContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      if (!token) throw new Error('Token não disponível');
      return await agendamentoService.deleteAgendamento(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      window.location.reload();
    },
    onError: (error) => {
      console.error('❌ Erro ao deletar agendamento:', error);
    }
  });
}

// Hook para invalidar cache
export function useInvalidateCache() {
  const { token } = useAuthContext();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('Token não disponível');
      return await agendamentoService.invalidateCache(token);
    },
    onSuccess: (data) => {
  // console.log('✅ Cache invalidado:', data);
      // Invalidar cache local também
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      // console.error('❌ Erro ao invalidar cache:', error);
      // Não propagar erros de throttle/debounce para não quebrar a UI
      if (!error.message.includes('protegendo contra requisições duplicadas')) {
        console.error('❌ Erro ao invalidar cache:', error);
      }
    }
  });
}

// Hook para sincronizar com Google Calendar (compatibilidade)
export function useSincronizarGoogleCalendar() {
  const { token } = useAuthContext();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('Token não disponível');
      return await agendamentoService.sincronizar(token);
    },
    onSuccess: () => {
  // console.log('✅ Sincronização realizada');
      // Invalidar cache dos agendamentos
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
    },
    onError: (error) => {
      console.error('❌ Erro ao sincronizar:', error);
    }
  });
}
