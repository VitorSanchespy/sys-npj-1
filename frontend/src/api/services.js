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
  register: async (nome, email, senha, telefone, role_id = 3) => {
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

  // Atualizar senha do usuário
  updatePassword: async (token, id, novaSenha) => {
    // Ajuste o endpoint conforme sua API backend
    return await apiRequest(`/api/usuarios/${id}/senha`, {
      method: 'PUT',
      token,
      body: { senha: novaSenha }
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
      body: { usuario_id: usuarioId, role, processo_id: Number(processoId) }
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

  // POST /api/agendamentos/:id/aprovar - Aprovar agendamento (Admin/Professor)
  aprovar: async (token, id, observacoes = '') => {
    return await apiRequest(`/api/agendamentos/${id}/aprovar`, {
      method: 'POST',
      token,
      body: { observacoes }
    });
  },

  // POST /api/agendamentos/:id/recusar - Recusar agendamento (Admin/Professor)
  recusar: async (token, id, motivo_recusa) => {
    return await apiRequest(`/api/agendamentos/${id}/recusar`, {
      method: 'POST',
      token,
      body: { motivo_recusa }
    });
  },

  // POST /api/convite/:id/aceitar - Aceitar convite de agendamento
  aceitarConvite: async (id, email) => {
    return await apiRequest(`/api/convite/${id}/aceitar`, {
      method: 'POST',
      body: { email }
    });
  },

  // POST /api/convite/:id/recusar - Recusar convite de agendamento
  recusarConvite: async (id, email, motivo) => {
    return await apiRequest(`/api/convite/${id}/recusar`, {
      method: 'POST',
      body: { email, motivo }
    });
  },

  // GET /api/convite/:id - Visualizar convite
  visualizarConvite: async (id) => {
    return await apiRequest(`/api/convite/${id}`, {
      method: 'GET'
    });
  }
};

// ===== SISTEMA DE NOTIFICAÇÃO REMOVIDO - SUBSTITUÍDO POR TOAST =====

// ===== AUXILIARY TABLES SERVICES (UPDATED) =====
export const tabelaAuxiliarService = {
  // Métodos para tabelas auxiliares - usando novo endpoint /api/tabelas-auxiliares
  getMateriaAssunto: async (token) => {
    const response = await apiRequest('/api/tabelas-auxiliares/materias', {
      method: 'GET',
      token
    });
    return response.success ? response.data : response;
  },

  getFase: async (token) => {
    const response = await apiRequest('/api/tabelas-auxiliares/fases', {
      method: 'GET',
      token
    });
    return response.success ? response.data : response;
  },

  getDiligencia: async (token) => {
    const response = await apiRequest('/api/tabelas-auxiliares/diligencias', {
      method: 'GET',
      token
    });
    return response.success ? response.data : response;
  },

  getLocalTramitacao: async (token) => {
    const response = await apiRequest('/api/tabelas-auxiliares/locais-tramitacao', {
      method: 'GET',
      token
    });
    return response.success ? response.data : response;
  },

  // Métodos de criação (apenas Admin pode criar)
  createMateriaAssunto: async (token, nome, descricao = '') => {
    const response = await apiRequest('/api/tabelas-auxiliares/materias', {
      method: 'POST',
      token,
      body: { nome, descricao }
    });
    return response.success ? response.data : response;
  },

  createFase: async (token, nome, descricao = '') => {
    const response = await apiRequest('/api/tabelas-auxiliares/fases', {
      method: 'POST',
      token,
      body: { nome, descricao }
    });
    return response.success ? response.data : response;
  },

  createDiligencia: async (token, nome, descricao = '') => {
    const response = await apiRequest('/api/tabelas-auxiliares/diligencias', {
      method: 'POST',
      token,
      body: { nome, descricao }
    });
    return response.success ? response.data : response;
  },

  createLocalTramitacao: async (token, nome, descricao = '') => {
    const response = await apiRequest('/api/tabelas-auxiliares/locais-tramitacao', {
      method: 'POST',
      token,
      body: { nome, descricao }
    });
    return response.success ? response.data : response;
  },

  // Métodos de exclusão (apenas Admin pode excluir)
  deleteMateriaAssunto: async (token, id) => {
    return await apiRequest(`/api/tabelas-auxiliares/materias/${id}`, {
      method: 'DELETE',
      token
    });
  },

  deleteFase: async (token, id) => {
    return await apiRequest(`/api/tabelas-auxiliares/fases/${id}`, {
      method: 'DELETE',
      token
    });
  },

  deleteDiligencia: async (token, id) => {
    return await apiRequest(`/api/tabelas-auxiliares/diligencias/${id}`, {
      method: 'DELETE',
      token
    });
  },

  deleteLocalTramitacao: async (token, id) => {
    return await apiRequest(`/api/tabelas-auxiliares/locais-tramitacao/${id}`, {
      method: 'DELETE',
      token
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

