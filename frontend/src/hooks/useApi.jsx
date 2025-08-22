import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api/apiRequest';
import { useAuthContext } from '../contexts/AuthContext';
import { requestCache } from '../utils/requestCache';

// Helper para verificar role
export const getUserRole = (user) => {
  if (!user) return null;
  
  if (typeof user.role === 'string') {
    return user.role;
  }
  
  if (user.role && typeof user.role === 'object') {
    return user.role.nome || user.role.name || null;
  }
  
  if (user.role_id === 1) return 'Admin';
  if (user.role_id === 2) return 'Professor';
  if (user.role_id === 3) return 'Aluno';
  
  return null;
};

// ===== HOOKS PARA PROCESSOS =====

export function useProcessos(search = "", showMyProcesses = false, page = 1, limit = 4, showConcluidos = false) {
  const { token, user } = useAuthContext();
  
  return useQuery({
    queryKey: ['processos', user?.id, getUserRole(user), search, showMyProcesses, page, limit, showConcluidos],
    queryFn: async () => {
      const userRole = getUserRole(user);
      if (!token || !userRole) throw new Error('Token ou usuário não disponível');
      
      let endpoint = "";
      let params = new URLSearchParams();
      
      // Configurar parâmetros de paginação
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      // Adicionar filtro de processos concluídos
      if (showConcluidos) {
        params.append('concluidos', 'true');
      }
      
      if (userRole === "Aluno") {
        endpoint = "/api/processos/usuario";
      } else if (userRole === "Professor") {
        if (showMyProcesses) {
          endpoint = "/api/processos/usuario";
        } else {
          endpoint = "/api/processos";
          // Para dashboard, buscar apenas os recentes
          if (limit === 4 && page === 1 && !search.trim() && !showConcluidos) {
            params.append('recent', 'true');
          }
        }
      } else if (userRole === "Admin") {
        if (showMyProcesses) {
          endpoint = "/api/processos/usuario";
        } else {
          endpoint = "/api/processos";
          // Para dashboard, buscar apenas os recentes
          if (limit === 4 && page === 1 && !search.trim() && !showConcluidos) {
            params.append('recent', 'true');
          }
        }
      }

      const response = await apiRequest(`${endpoint}?${params.toString()}`, { token });
      
      // Se a resposta é um array simples (compatibilidade com versão antiga)
      if (Array.isArray(response)) {
        let data = response;
        
        // Filtrar por termo de busca se fornecido
        if (search.trim()) {
          data = data.filter(proc => 
            proc.numero_processo?.toLowerCase().includes(search.toLowerCase()) ||
            proc.numero?.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        // Aplicar paginação manual se necessário
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = data.slice(startIndex, endIndex);
        
        return {
          processos: paginatedData,
          totalItems: data.length,
          currentPage: page,
          totalPages: Math.ceil(data.length / limit),
          hasMore: endIndex < data.length
        };
      }
      
      // Se a resposta já tem estrutura de paginação
      let data = response.data || response.processos || [];
      
      // Filtrar por termo de busca se fornecido
      if (search.trim()) {
        data = data.filter(proc => 
          proc.numero_processo?.toLowerCase().includes(search.toLowerCase()) ||
          proc.numero?.toLowerCase().includes(search.toLowerCase())
        );
        
        // Recalcular paginação após filtro
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = data.slice(startIndex, endIndex);
        
        return {
          processos: paginatedData,
          totalItems: data.length,
          currentPage: page,
          totalPages: Math.ceil(data.length / limit),
          hasMore: endIndex < data.length
        };
      }

      // Garantir estrutura consistente para outros casos
      return {
        processos: response.data || response.processos || [],
        totalItems: response.totalItems || (response.data || response.processos || []).length,
        currentPage: response.currentPage || page,
        totalPages: response.totalPages || 1,
        hasMore: response.hasMore || false
      };
    },
    enabled: !!(token && user),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos (substituiu cacheTime)
  });
}

// Hook simples para compatibilidade (sem paginação)
export function useProcessosSimple(search = "", showMyProcesses = false) {
  const result = useProcessos(search, showMyProcesses, 1, 1000); // Buscar muitos itens
  return {
    ...result,
    data: result.data?.processos || [] // Retornar apenas o array para compatibilidade
  };
}

// ===== HOOKS GEOGRAFIA =====

export function useEstados() {
  const { token } = useAuthContext();
  
  return useQuery({
    queryKey: ['estados'],
    queryFn: async () => {
      const data = await apiRequest('/api/estados', { token });
      return data;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 60, // 1 hora - dados geográficos não mudam
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}

export function useCidades(estadoId) {
  const { token } = useAuthContext();
  
  return useQuery({
    queryKey: ['cidades', estadoId],
    queryFn: async () => {
      if (!estadoId) return [];
      const data = await apiRequest(`/api/cidades/${estadoId}`, { token });
      return data;
    },
    enabled: !!(token && estadoId),
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}

// ===== HOOKS PARA DASHBOARD =====

export function useDashboardData() {
  const { token, user } = useAuthContext();
  
  return useQuery({
    queryKey: ['dashboard', user?.id, getUserRole(user)],
    queryFn: async () => {
      const userRole = getUserRole(user);
      if (!token || !userRole) {
        throw new Error(`Token ou usuário não disponível`);
      }

  // Removido console.log

      try {
        // Buscar dados dinâmicos baseados no perfil do backend
        const dashboardData = await apiRequest('/api/dashboard', { token });
        
  // Removido console.log

        // Retornar dados na estrutura esperada pelo componente
        return {
          // Dados principais
          processosTotal: dashboardData.processosTotal || 0,
          processosAtivos: dashboardData.processosAtivos || 0,
          processosPorStatus: dashboardData.processosPorStatus || {},
          
          // Dados de usuários (apenas para Admin/Professor)
          totalUsuarios: dashboardData.totalUsuarios || 0,
          usuariosAtivos: dashboardData.usuariosAtivos || 0,
          usuariosPorTipo: dashboardData.usuariosPorTipo || {},
          
          // Dados de arquivos/documentos
          totalArquivos: dashboardData.totalArquivos || 0,
          
          // Dados de agendamentos
          agendamentosTotal: dashboardData.agendamentosTotal || 0,
          agendamentosPorTipo: dashboardData.agendamentosPorTipo || {},
          agendamentosPorStatus: dashboardData.agendamentosPorStatus || {},
          
          // Metadados
          userRole: dashboardData.userRole || userRole,
          ultimaAtualizacao: dashboardData.ultimaAtualizacao,
          estatisticas: dashboardData.estatisticas || {},
          
          // Arrays para compatibilidade (se existirem)
          processos: dashboardData.processos || [],
          agendamentos: dashboardData.agendamentos || [],
          usuarios: dashboardData.usuarios || [],
          
          // Compatibilidade com estrutura anterior
          processosRecentes: (dashboardData.processos || []).slice(0, 4),
          statusCounts: dashboardData.processosPorStatus || {},
          totalProcessos: dashboardData.processosTotal || 0
        };
        
      } catch (error) {
        console.error(`❌ Erro ao buscar dados do dashboard:`, error);
        
        // Fallback: retornar dados vazios mas válidos
        return {
          processosTotal: 0,
          processosAtivos: 0,
          processosPorStatus: {},
          totalUsuarios: 0,
          usuariosAtivos: 0,
          usuariosPorTipo: {},
          agendamentosTotal: 0,
          agendamentosPorTipo: {},
          agendamentosPorStatus: {},
          userRole: userRole,
          ultimaAtualizacao: new Date().toISOString(),
          estatisticas: {},
          processos: [],
          agendamentos: [],
          usuarios: [],
          processosRecentes: [],
          statusCounts: {},
          totalProcessos: 0,
          erro: error.message
        };
      }
    },
    enabled: !!(token && user),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 2
  });
}

// ===== HOOKS PARA USUÁRIOS =====

export function useUsuarios(search = "") {
  const { token, user } = useAuthContext();
  
  return useQuery({
    queryKey: ['usuarios', getUserRole(user), search],
    queryFn: async () => {
      const userRole = getUserRole(user);
      if (!token || !userRole) throw new Error('Token ou usuário não disponível');
      
      // Admin pode ver todos, Professor pode ver alunos
      let endpoint = "/api/usuarios";
      if (userRole === "Professor") {
        endpoint = "/api/usuarios/alunos";
      }
      
      let data = await apiRequest(endpoint, { token });
      
      // Filtrar por termo de busca se fornecido
      if (search.trim()) {
        data = data.filter(usuario => 
          usuario.nome?.toLowerCase().includes(search.toLowerCase()) ||
          usuario.email?.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      return data;
    },
    enabled: !!(token && user),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 15, // 15 minutos
  });
}

export function useUsuario(id) {
  const { token } = useAuthContext();
  
  return useQuery({
    queryKey: ['usuario', id],
    queryFn: async () => {
      if (!id) return null;
      const data = await apiRequest(`/api/usuarios/${id}`, { token });
      return data;
    },
    enabled: !!(token && id),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
  });
}

// ===== MUTATION HOOKS =====

export function useCreateUsuario() {
  const { token } = useAuthContext();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData) => {
      return await apiRequest('/api/usuarios', {
        method: 'POST',
        token,
        body: userData
      });
    },
    onSuccess: () => {
      // Auto-refresh sem reload
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      console.log('✅ Usuário criado - dados atualizados automaticamente');
    }
  });
}

export function useUpdateUsuario() {
  const { token } = useAuthContext();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...userData }) => {
      return await apiRequest(`/api/usuarios/${id}`, {
        method: 'PUT',
        token,
        body: userData
      });
    },
    onSuccess: (data, variables) => {
      // Auto-refresh sem reload
      queryClient.invalidateQueries({ queryKey: ['usuario', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      console.log('✅ Usuário atualizado - dados atualizados automaticamente');
    }
  });
}

export function useDeleteUsuario() {
  const { token } = useAuthContext();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      return await apiRequest(`/api/usuarios/${id}`, {
        method: 'DELETE',
        token
      });
    },
    onSuccess: () => {
      // Auto-refresh sem reload
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      console.log('✅ Usuário removido - dados atualizados automaticamente');
    }
  });
}

export function useCreateProcesso() {
  const { token } = useAuthContext();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (processoData) => {
      return await apiRequest('/api/processos', {
        method: 'POST',
        token,
        body: processoData
      });
    },
    onSuccess: () => {
      // Auto-refresh sem reload completo
      queryClient.invalidateQueries({ queryKey: ['processos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Mostrar feedback de sucesso
      console.log('✅ Processo criado - dados atualizados automaticamente');
    }
  });
}

export function useUpdateProcesso() {
  const { token } = useAuthContext();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...processoData }) => {
      return await apiRequest(`/api/processos/${id}`, {
        method: 'PUT',
        token,
        body: processoData
      });
    },
    onSuccess: (data, variables) => {
      // Auto-refresh sem reload completo
      queryClient.invalidateQueries({ queryKey: ['processo', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['processos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Mostrar feedback de sucesso
      console.log('✅ Processo atualizado - dados atualizados automaticamente');
    }
  });
}

// ===== FUNÇÕES UTILITÁRIAS =====

// Função para baixar relatório em PDF
export const downloadRelatorio = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token não encontrado');

    const response = await fetch('/api/dashboard/relatorio', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Erro ao baixar relatório');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `relatorio-npj-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Erro ao baixar relatório:', error);
    throw error;
  }
};

// ===== HOOK GENÉRICO (para compatibilidade) =====

export default function useApi() {
  // Retorna funções úteis para componentes legados
  return {
    getUserRole,
    downloadRelatorio,
    // Adicionar outras funções conforme necessário
  };
}