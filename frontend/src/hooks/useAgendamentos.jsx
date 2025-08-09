import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agendamentoService } from '../api/services';
import { useAuthContext } from '../contexts/AuthContext';

// Hook para listar agendamentos
export function useAgendamentos(filtros = {}) {
  const { token } = useAuthContext();
  
  return useQuery({
    queryKey: ['agendamentos', filtros],
    queryFn: async () => {
      if (!token) throw new Error('Token não disponível');
      return await agendamentoService.listAgendamentos(token);
    },
    enabled: !!token,
    staleTime: 10 * 1000, // 10 segundos
    cacheTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 10 * 1000, // Atualiza a cada 10 segundos
    refetchOnWindowFocus: true,
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
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}

// Hook para obter agendamento por ID
export function useAgendamento(id) {
  const { token } = useAuthContext();
  
  return useQuery({
    queryKey: ['agendamentos', id],
    queryFn: async () => {
      if (!token) throw new Error('Token não disponível');
      return await agendamentoService.getAgendamentoById(token, id);
    },
    enabled: !!token && !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}

// Hook para obter estatísticas de agendamentos
export function useEstatisticasAgendamentos() {
  const { token } = useAuthContext();
  
  return useQuery({
    queryKey: ['agendamentos', 'estatisticas'],
    queryFn: async () => {
      if (!token) throw new Error('Token não disponível');
      // Usando apiRequest diretamente para nova rota de estatísticas
      const response = await fetch('/api/agendamentos/estatisticas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Erro ao buscar estatísticas');
      return await response.json();
    },
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutos
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
      // Invalidar cache dos agendamentos
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
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
    onSuccess: (data, variables) => {
      // Invalidar cache específico do agendamento e da lista
      queryClient.invalidateQueries({ queryKey: ['agendamentos', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
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
      // Invalidar cache dos agendamentos
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Hook para sincronizar com Google Calendar
export function useSincronizarGoogleCalendar() {
  const { token } = useAuthContext();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      if (!token) throw new Error('Token não disponível');
      const response = await fetch(`/api/agendamentos/${id}/sincronizar-google`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Erro ao sincronizar com Google Calendar');
      return await response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidar cache do agendamento específico
      queryClient.invalidateQueries({ queryKey: ['agendamentos', variables] });
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
    },
  });
}
