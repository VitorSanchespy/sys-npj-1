// API Services - Camada de serviços que centraliza todas as chamadas para o backend
import { apiRequest, uploadFile } from './apiRequest.js';
import { API_BASE_URL } from '../utils/constants.js';

// ===== AUTH SERVICES =====
export const authService = {
  // POST /auth/login
  login: async (email, senha) => {
    return await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, senha }
    });
  },

  // POST /auth/registro (corrigido endpoint)
  register: async (nome, email, senha, telefone, role_id = 2) => {
    return await apiRequest('/auth/registro', {
      method: 'POST',
      body: { nome, email, senha, telefone, role_id }
    });
  },

  // POST /auth/esqueci-senha
  forgotPassword: async (email) => {
    return await apiRequest('/auth/esqueci-senha', {
      method: 'POST',
      body: { email }
    });
  },

  // POST /auth/redefinir-senha
  resetPassword: async (token, novaSenha) => {
    return await apiRequest('/auth/redefinir-senha', {
      method: 'POST',
      body: { novaSenha },
      token
    });
  },

  // GET /auth/perfil
  getProfile: async (token) => {
    return await apiRequest('/auth/perfil', {
      method: 'GET',
      token
    });
  },

  // POST /auth/refresh
  refreshToken: async (refreshToken) => {
    return await apiRequest('/auth/refresh', {
      method: 'POST',
      body: { refreshToken }
    });
  },
};

// ===== USER SERVICES (UPDATED) =====
export const userService = {
  // GET /api/usuarios
  listUsers: async (token) => {
    return await apiRequest('/api/usuarios', {
      method: 'GET',
      token
    });
  },

  // POST /api/usuarios
  createUser: async (token, userData) => {
    return await apiRequest('/api/usuarios', {
      method: 'POST',
      token,
      body: userData
    });
  },

  // GET /api/usuarios/:id
  getUserById: async (token, id) => {
    return await apiRequest(`/api/usuarios/${id}`, {
      method: 'GET',
      token
    });
  },

  // PUT /api/usuarios/:id
  updateUser: async (token, id, userData) => {
    return await apiRequest(`/api/usuarios/${id}`, {
      method: 'PUT',
      token,
      body: userData
    });
  },

  // DELETE /api/usuarios/:id
  deleteUser: async (token, id) => {
    return await apiRequest(`/api/usuarios/${id}`, {
      method: 'DELETE',
      token
    });
  },

  // GET /api/usuarios/para-vinculacao
  getUsersForAssignment: async (token, search) => {
    return await apiRequest(`/api/usuarios/para-vinculacao?search=${encodeURIComponent(search)}`, {
      method: 'GET',
      token
    });
  },

  // GET /api/usuarios (com busca)
  getAllUsers: async (token, search = '') => {
    const url = search
      ? `/api/usuarios?search=${encodeURIComponent(search)}`
      : '/api/usuarios';
    return apiRequest(url, { token });
  },

  // Reativar usuário (PATCH ou PUT, conforme sua API)
  reactivateUser: async (token, id) => {
    // Ajuste o método e endpoint conforme sua API
    return await apiRequest(`/api/usuarios/${id}/reativar`, {
      method: 'PUT',
      token
    });
  },
};

// ===== PROCESS SERVICES (UPDATED) =====
export const processService = {
  // GET /api/processos
  listProcesses: async (token) => {
    return await apiRequest('/api/processos', {
      method: 'GET',
      token
    });
  },

  // POST /api/processos
  createProcess: async (token, processData) => {
    return await apiRequest('/api/processos', {
      method: 'POST',
      token,
      body: processData
    });
  },

  // GET /api/processos/usuario
  getProcessosUsuario: async (token) => {
    return await apiRequest('/api/processos/usuario', {
      method: 'GET',
      token
    });
  },

  // GET /api/processos/:id
  getProcessById: async (token, id) => {
    return await apiRequest(`/api/processos/${id}`, {
      method: 'GET',
      token
    });
  },

  // PUT /api/processos/:id - Atualizar dados do processo
  updateProcess: async (token, id, processData) => {
    // Log apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 DEBUG Process Update:', { id, processData, hasToken: !!token });
    }
    
    return await apiRequest(`/api/processos/${id}`, {
      method: 'PUT',
      token,
      body: processData
    });
  },

  // DELETE /api/processos/:id
  deleteProcess: async (token, id) => {
    return await apiRequest(`/api/processos/${id}`, {
      method: 'DELETE',
      token
    });
  },

  // Aliases para compatibilidade
  getAllProcesses: async (token) => {
    return await apiRequest('/api/processos', {
      method: 'GET',
      token
    });
  },

  getMyProcesses: async (token) => {
    return await apiRequest('/api/processos/usuario', {
      method: 'GET',
      token
    });
  },

  // POST /api/processos/:id/vincular-usuario
  assignUserToProcess: async (token, processoId, usuarioId, role) => {
    return await apiRequest(`/api/processos/${processoId}/vincular-usuario`, {
      method: 'POST',
      token,
      body: { usuario_id: usuarioId, role }
    });
  },

  // DELETE /api/processos/:id/desvincular-usuario  
  removeUserFromProcess: async (token, processoId, usuarioId) => {
    return await apiRequest(`/api/processos/${processoId}/desvincular-usuario`, {
      method: 'DELETE',
      token,
      body: { usuario_id: usuarioId }
    });
  },

  // PUT /api/processos/:id/concluir
  concludeProcess: async (token, processoId) => {
    return await apiRequest(`/api/processos/${processoId}/concluir`, {
      method: 'PUT',
      token
    });
  },

  // PUT /api/processos/:id/reabrir
  reopenProcess: async (token, processoId) => {
    return await apiRequest(`/api/processos/${processoId}/reabrir`, {
      method: 'PUT',
      token
    });
  }
};

// ===== AGENDAMENTO SERVICES - Refatorado para sincronização com Google Calendar =====
export const agendamentoService = {
  // GET /api/agendamentos - Listar agendamentos com filtros
  listAgendamentos: async (token, filtros = {}) => {
    const queryParams = new URLSearchParams();
    
    // Adicionar filtros opcionais
    if (filtros.offset !== undefined) queryParams.append('offset', filtros.offset);
    if (filtros.limit !== undefined) queryParams.append('limit', filtros.limit);
    if (filtros.busca) queryParams.append('busca', filtros.busca);
    if (filtros.dataInicio) queryParams.append('dataInicio', filtros.dataInicio);
    if (filtros.dataFim) queryParams.append('dataFim', filtros.dataFim);
    if (filtros.tipoEvento) queryParams.append('tipoEvento', filtros.tipoEvento);

    const url = queryParams.toString() ? `/api/agendamentos?${queryParams}` : '/api/agendamentos';
    
    return await apiRequest(url, {
      method: 'GET',
      token
    });
  },

  // POST /api/agendamentos - Criar agendamento
  createAgendamento: async (token, agendamentoData) => {
    // Normalizar dados antes de enviar
    const dadosNormalizados = {
      titulo: agendamentoData.titulo,
      descricao: agendamentoData.descricao || '',
      local: agendamentoData.local || '',
      data_inicio: agendamentoData.data_inicio || agendamentoData.dataEvento,
      data_fim: agendamentoData.data_fim || agendamentoData.dataFim,
      tipo_evento: agendamentoData.tipo_evento || agendamentoData.tipoEvento || 'outro',
      processo_id: agendamentoData.processo_id || agendamentoData.processoId || null,
      lembrete_1_dia: agendamentoData.lembrete_1_dia !== undefined ? agendamentoData.lembrete_1_dia : 
                     agendamentoData.lembrete1Dia !== undefined ? agendamentoData.lembrete1Dia : true,
      lembrete_2_dias: agendamentoData.lembrete_2_dias !== undefined ? agendamentoData.lembrete_2_dias : 
                      agendamentoData.lembrete2Dias !== undefined ? agendamentoData.lembrete2Dias : false,
      lembrete_1_semana: agendamentoData.lembrete_1_semana !== undefined ? agendamentoData.lembrete_1_semana : 
                        agendamentoData.lembrete1Semana !== undefined ? agendamentoData.lembrete1Semana : false
    };

    return await apiRequest('/api/agendamentos', {
      method: 'POST',
      token,
      body: dadosNormalizados
    });
  },

  // GET /api/agendamentos/usuario
  listAgendamentosUsuario: async (token) => {
    return await apiRequest('/api/agendamentos/usuario', {
      method: 'GET',
      token
    });
  },

  // GET /api/agendamentos/periodo
  listAgendamentosPeriodo: async (token, dataInicio, dataFim) => {
    const queryParams = new URLSearchParams({ 
      inicio: dataInicio, 
      fim: dataFim 
    }).toString();
    return await apiRequest(`/api/agendamentos/periodo?${queryParams}`, {
      method: 'GET',
      token
    });
  },

  // GET /api/agendamentos/estatisticas
  getEstatisticas: async (token) => {
    return await apiRequest('/api/agendamentos/estatisticas', {
      method: 'GET',
      token
    });
  },

  // GET /api/agendamentos/conexao
  checkConnection: async (token) => {
    return await apiRequest('/api/agendamentos/conexao', {
      method: 'GET',
      token
    });
  },

  // POST /api/agendamentos/invalidar-cache
  invalidateCache: async (token) => {
    return await apiRequest('/api/agendamentos/invalidar-cache', {
      method: 'POST',
      token
    });
  },

  // GET /api/agendamentos/:id
  getAgendamentoById: async (token, id) => {
    return await apiRequest(`/api/agendamentos/${id}`, {
      method: 'GET',
      token
    });
  },

  // PUT /api/agendamentos/:id
  updateAgendamento: async (token, id, agendamentoData) => {
    // Normalizar dados antes de enviar
    const dadosNormalizados = {
      titulo: agendamentoData.titulo,
      descricao: agendamentoData.descricao,
      local: agendamentoData.local,
      data_evento: agendamentoData.data_evento || agendamentoData.data_inicio || agendamentoData.dataEvento,
      data_fim: agendamentoData.data_fim || agendamentoData.dataFim,
      tipo_evento: agendamentoData.tipo_evento || agendamentoData.tipoEvento,
      processo_id: agendamentoData.processo_id || agendamentoData.processoId,
      lembrete_1_dia: agendamentoData.lembrete_1_dia !== undefined ? agendamentoData.lembrete_1_dia : agendamentoData.lembrete1Dia,
      lembrete_2_dias: agendamentoData.lembrete_2_dias !== undefined ? agendamentoData.lembrete_2_dias : agendamentoData.lembrete2Dias,
      lembrete_1_semana: agendamentoData.lembrete_1_semana !== undefined ? agendamentoData.lembrete_1_semana : agendamentoData.lembrete1Semana
    };

    return await apiRequest(`/api/agendamentos/${id}`, {
      method: 'PUT',
      token,
      body: dadosNormalizados
    });
  },

  // DELETE /api/agendamentos/:id
  deleteAgendamento: async (token, id) => {
    return await apiRequest(`/api/agendamentos/${id}`, {
      method: 'DELETE',
      token
    });
  },

  // POST /api/agendamentos/sincronizar
  sincronizar: async (token) => {
    return await apiRequest('/api/agendamentos/sincronizar', {
      method: 'POST',
      token
    });
  },

  // POST /api/agendamentos/sincronizar
  sincronizar: async (token) => {
    return await apiRequest('/api/agendamentos/sincronizar', {
      method: 'POST',
      token
    });
  }
};

// ===== NOTIFICATION SERVICES =====
export const notificacaoService = {
  // GET /api/notificacoes
  listNotificacoes: async (token) => {
    return await apiRequest('/api/notificacoes', {
      method: 'GET',
      token
    });
  },

  // POST /api/notificacoes
  createNotificacao: async (token, notificacaoData) => {
    return await apiRequest('/api/notificacoes', {
      method: 'POST',
      token,
      body: notificacaoData
    });
  },

  // GET /api/notificacoes/usuario
  listNotificacoesUsuario: async (token) => {
    return await apiRequest('/api/notificacoes/usuario', {
      method: 'GET',
      token
    });
  },

  // GET /api/notificacoes/nao-lidas/count
  countNaoLidas: async (token) => {
    return await apiRequest('/api/notificacoes/nao-lidas/count', {
      method: 'GET',
      token
    });
  },

  // PUT /api/notificacoes/marcar-todas-lidas
  marcarTodasLidas: async (token) => {
    return await apiRequest('/api/notificacoes/marcar-todas-lidas', {
      method: 'PUT',
      token
    });
  },

  // GET /api/notificacoes/:id
  getNotificacaoById: async (token, id) => {
    return await apiRequest(`/api/notificacoes/${id}`, {
      method: 'GET',
      token
    });
  },

  // PUT /api/notificacoes/:id/lida
  marcarComoLida: async (token, id) => {
    return await apiRequest(`/api/notificacoes/${id}/lida`, {
      method: 'PUT',
      token
    });
  },

  // DELETE /api/notificacoes/:id
  deleteNotificacao: async (token, id) => {
    return await apiRequest(`/api/notificacoes/${id}`, {
      method: 'DELETE',
      token
    });
  }
};

// ===== AUXILIARY TABLES SERVICES (UPDATED) =====
export const tabelaAuxiliarService = {
  // GET /api/tabelas/roles (único endpoint funcional)
  getRoles: async (token) => {
    return await apiRequest('/api/tabelas/roles', {
      method: 'GET',
      token
    });
  },

  // Métodos para tabelas auxiliares
  getMateriaAssunto: async (token) => {
    return await apiRequest('/api/tabelas/materia-assunto', {
      method: 'GET',
      token
    });
  },

  getFase: async (token) => {
    return await apiRequest('/api/tabelas/fases', {
      method: 'GET',
      token
    });
  },

  getDiligencia: async (token) => {
    return await apiRequest('/api/tabelas/diligencias', {
      method: 'GET',
      token
    });
  },

  getLocalTramitacao: async (token) => {
    return await apiRequest('/api/tabelas/locais-tramitacao', {
      method: 'GET',
      token
    });
  },

  // Métodos de criação (implementação básica - podem precisar de endpoints no backend)
  createMateriaAssunto: async (token, nome) => {
    return await apiRequest('/api/tabelas/materia-assunto', {
      method: 'POST',
      token,
      body: { nome }
    });
  },

  createFase: async (token, nome) => {
    return await apiRequest('/api/tabelas/fases', {
      method: 'POST',
      token,
      body: { nome }
    });
  },

  createDiligencia: async (token, nome) => {
    return await apiRequest('/api/tabelas/diligencias', {
      method: 'POST',
      token,
      body: { nome }
    });
  },

  createLocalTramitacao: async (token, nome) => {
    return await apiRequest('/api/tabelas/locais-tramitacao', {
      method: 'POST',
      token,
      body: { nome }
    });
  }
};

// ===== PROCESS UPDATE SERVICES (UPDATED) =====
export const atualizacaoProcessoService = {
  // GET /api/atualizacoes
  listAtualizacoes: async (token, queryParams = '') => {
    return await apiRequest(`/api/atualizacoes${queryParams}`, {
      method: 'GET',
      token
    });
  },

  // POST /api/atualizacoes
  createAtualizacao: async (token, atualizacaoData) => {
    return await apiRequest('/api/atualizacoes', {
      method: 'POST',
      token,
      body: atualizacaoData
    });
  },

  // GET /api/atualizacoes/:id
  getAtualizacaoById: async (token, id) => {
    return await apiRequest(`/api/atualizacoes/${id}`, {
      method: 'GET',
      token
    });
  },

  // PUT /api/atualizacoes/:id
  updateAtualizacao: async (token, id, atualizacaoData) => {
    return await apiRequest(`/api/atualizacoes/${id}`, {
      method: 'PUT',
      token,
      body: atualizacaoData
    });
  },

  // DELETE /api/atualizacoes/:id
  deleteAtualizacao: async (token, id) => {
    return await apiRequest(`/api/atualizacoes/${id}`, {
      method: 'DELETE',
      token
    });
  }
};

// ===== FILE SERVICES (UPDATED) =====
export const arquivoService = {
  // GET /api/arquivos
  listArquivos: async (token) => {
    return await apiRequest('/api/arquivos', {
      method: 'GET',
      token
    });
  },

  // POST /api/arquivos/upload
  uploadArquivo: async (token, formData) => {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const requestOptions = {
      method: 'POST',
      headers,
      body: formData
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/arquivos/upload`, requestOptions);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.erro || 'Erro no upload');
      }
      return await response.json();
    } catch (error) {
      // Log apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro no upload:', error);
      }
      throw error;
    }
  },

  // GET /api/arquivos/:id
  getArquivoById: async (token, id) => {
    return await apiRequest(`/api/arquivos/${id}`, {
      method: 'GET',
      token
    });
  },

  // GET /api/arquivos/:id/download
  downloadArquivo: async (token, id) => {
    return await apiRequest(`/api/arquivos/${id}/download`, {
      method: 'GET',
      token
    });
  },

  // DELETE /api/arquivos/:id
  deleteArquivo: async (token, id) => {
    return await apiRequest(`/api/arquivos/${id}`, {
      method: 'DELETE',
      token
    });
  }
};

