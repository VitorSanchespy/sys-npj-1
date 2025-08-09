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
  if (user.role_id === 2) return 'Aluno';
  if (user.role_id === 3) return 'Professor';
  
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
      let data = response.processos || [];
      
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

      return response;
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
      
      try {
        // Usar cache para requisições simultâneas
        const requests = [
          { key: 'processos', url: '/api/processos?recent=true&limit=4' },
          { key: 'agendamentos', url: '/api/agendamentos' }
        ];

        // Adicionar requisições específicas para Admin/Professor
        if (userRole === "Admin" || userRole === "Professor") {
          requests.push({ key: 'usuarios', url: '/api/usuarios' });
        }

        // Executar todas as requisições com cache
        const results = await Promise.allSettled(
          requests.map(({ key, url }) => 
            requestCache.getOrFetch(
              `${url}:${token}`,
              () => apiRequest(url, { token })
            ).catch(error => {
              console.warn(`⚠️ Falha em ${url}:`, error.message);
              return getDefaultValue(key);
            })
          )
        );

        // Processar resultados
        const data = requests.reduce((acc, { key }, index) => {
          const result = results[index];
          acc[key] = result.status === 'fulfilled' ? result.value : getDefaultValue(key);
          return acc;
        }, {});

        // Garantir que processos é sempre um array
        let processos = [];
        if (data.processos) {
          if (Array.isArray(data.processos)) {
            processos = data.processos;
          } else if (data.processos.processos && Array.isArray(data.processos.processos)) {
            processos = data.processos.processos;
          }
        }

        // Estruturar dados do dashboard
        const dashboardData = {
          processos: processos,
          processosRecentes: processos.slice(0, 4), // Agora garantimos que é array
          agendamentos: Array.isArray(data.agendamentos) ? data.agendamentos : [],
          usuarios: Array.isArray(data.usuarios) ? data.usuarios : []
        };

        // Calcular estatísticas baseadas nos dados disponíveis
        const statusCounts = dashboardData.processos.reduce((acc, proc) => {
          const status = proc.status || 'Indefinido';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

        dashboardData.statusCounts = statusCounts;
        dashboardData.totalProcessos = dashboardData.processos.length;
        dashboardData.processosAtivos = dashboardData.processos.filter(p => p.status !== 'arquivado').length;
        
        dashboardData.processosPorStatus = {
          ativo: statusCounts.ativo || 0,
          em_andamento: statusCounts.em_andamento || 0,
          finalizado: statusCounts.finalizado || 0,
          arquivado: statusCounts.arquivado || 0
        };

        if (userRole === "Admin") {
          dashboardData.totalUsuarios = data.usuarios?.length || 0;
          dashboardData.usuariosAtivos = data.usuarios?.filter(u => u.ativo)?.length || 0;
          
          // Calcular usuários por tipo
          const usuariosPorTipo = data.usuarios?.reduce((acc, user) => {
            const role = getUserRole(user) || 'Outros';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
          }, {}) || {};
          
          dashboardData.usuariosPorTipo = usuariosPorTipo;
        }

        return dashboardData;
      } catch (error) {
        console.error('Erro na busca do dashboard:', error);
        throw error;
      }
    },
    enabled: !!(token && user),
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 2
  });
}

// Função helper para valores padrão
function getDefaultValue(key) {
  const defaults = {
    processos: [],
    agendamentos: [],
    usuarios: []
  };
  return defaults[key] || null;
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
      // Invalidar cache de usuários
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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
      // Invalidar cache específico do usuário e lista geral
      queryClient.invalidateQueries({ queryKey: ['usuario', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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
      // Invalidar cache de usuários
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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
      // Invalidar cache de processos
      queryClient.invalidateQueries({ queryKey: ['processos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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
      // Invalidar cache específico do processo e lista geral
      queryClient.invalidateQueries({ queryKey: ['processo', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['processos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}

// ===== HOOK GENÉRICO (para compatibilidade) =====

export default function useApi() {
  // Retorna funções úteis para componentes legados
  return {
    getUserRole,
    // Adicionar outras funções conforme necessário
  };
}