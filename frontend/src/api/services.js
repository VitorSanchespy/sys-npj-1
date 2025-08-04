import { apiRequest, uploadFile } from './apiRequest.js';

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
  register: async (nome, email, senha, role_id = 2) => {
    return await apiRequest('/auth/registro', {
      method: 'POST',
      body: { nome, email, senha, role_id }
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
  }
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

  // PUT /api/processos/:id
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
  }
};

// ===== SCHEDULING SERVICES =====
export const agendamentoService = {
  // GET /api/agendamentos
  listAgendamentos: async (token) => {
    return await apiRequest('/api/agendamentos', {
      method: 'GET',
      token
    });
  },

  // POST /api/agendamentos
  createAgendamento: async (token, agendamentoData) => {
    return await apiRequest('/api/agendamentos', {
      method: 'POST',
      token,
      body: agendamentoData
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
    const queryParams = new URLSearchParams({ dataInicio, dataFim }).toString();
    return await apiRequest(`/api/agendamentos/periodo?${queryParams}`, {
      method: 'GET',
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
    return await apiRequest(`/api/agendamentos/${id}`, {
      method: 'PUT',
      token,
      body: agendamentoData
    });
  },

  // DELETE /api/agendamentos/:id
  deleteAgendamento: async (token, id) => {
    return await apiRequest(`/api/agendamentos/${id}`, {
      method: 'DELETE',
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
  listAtualizacoes: async (token) => {
    return await apiRequest('/api/atualizacoes', {
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
  uploadArquivo: async (token, file) => {
    return await uploadFile('/api/arquivos/upload', file, { token });
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

