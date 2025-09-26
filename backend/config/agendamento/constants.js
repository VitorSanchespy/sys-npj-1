/**
 * Constantes do Sistema de Agendamentos
 * Centraliza todos os valores mágicos e configurações
 */

// Status dos agendamentos
const AGENDAMENTO_STATUS = {
  EM_ANALISE: 'em_analise',
  ENVIANDO_CONVITES: 'enviando_convites', 
  PENDENTE: 'pendente',
  MARCADO: 'marcado',
  CANCELADO: 'cancelado',
  FINALIZADO: 'finalizado'
};

// Status dos convidados
const CONVIDADO_STATUS = {
  PENDENTE: 'pendente',
  ACEITO: 'aceito',
  RECUSADO: 'recusado'
};

// Tipos de agendamento
const AGENDAMENTO_TIPOS = {
  REUNIAO: 'reuniao',
  AUDIENCIA: 'audiencia',
  PRAZO: 'prazo',
  OUTRO: 'outro'
};

// Limites e configurações
const AGENDAMENTO_LIMITS = {
  MAX_CONVIDADOS: 10,
  MAX_NOME_LENGTH: 100,
  MAX_TITULO_LENGTH: 255,
  MAX_DESCRICAO_LENGTH: 1000,
  MAX_LOCAL_LENGTH: 500,
  MAX_OBSERVACOES_LENGTH: 1000,
  MIN_TITULO_LENGTH: 3,
  MIN_MOTIVO_RECUSA_LENGTH: 10
};

// Configurações de tempo
const TEMPO_CONFIG = {
  EXPIRACAO_CONVITE_HORAS: 24,
  LEMBRETE_ANTECEDENCIA_HORAS: 1,
  LEMBRETE_DIARIO_HORA: 8 // 8h da manhã
};

// Roles de usuário
const USER_ROLES = {
  ADMIN: 'Admin',
  PROFESSOR: 'Professor',
  ALUNO: 'Aluno'
};

// Roles que podem auto-aprovar
const AUTO_APPROVE_ROLES = [USER_ROLES.ADMIN, USER_ROLES.PROFESSOR];

// Regex para validações
const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
};

// Mensagens de erro padronizadas
const ERROR_MESSAGES = {
  AGENDAMENTO_NAO_ENCONTRADO: 'Agendamento não encontrado',
  PROCESSO_NAO_ENCONTRADO: 'Processo não encontrado',
  USUARIO_NAO_AUTORIZADO: 'Usuário não autorizado para esta ação',
  EMAIL_INVALIDO: 'Formato de email inválido',
  EMAIL_DUPLICADO: 'Email duplicado encontrado',
  LIMITE_CONVIDADOS_EXCEDIDO: 'Limite máximo de convidados excedido',
  CONVITE_EXPIRADO: 'Este convite expirou. Links de convite são válidos por apenas 24 horas',
  AGENDAMENTO_CANCELADO: 'Este agendamento foi cancelado',
  JA_RESPONDEU_CONVITE: 'Você já respondeu a este convite',
  EMAIL_NAO_ENCONTRADO: 'Email não encontrado na lista de convidados',
  JUSTIFICATIVA_OBRIGATORIA: 'Justificativa é obrigatória para recusar um convite',
  ERRO_INTERNO_SERVIDOR: 'Erro interno do servidor'
};

// Mensagens de sucesso padronizadas
const SUCCESS_MESSAGES = {
  AGENDAMENTO_CRIADO: 'Agendamento criado com sucesso',
  AGENDAMENTO_ATUALIZADO: 'Agendamento atualizado com sucesso',
  AGENDAMENTO_APROVADO: 'Agendamento aprovado com sucesso',
  AGENDAMENTO_CANCELADO: 'Agendamento cancelado com sucesso',
  CONVITE_ACEITO: 'Convite aceito com sucesso! Obrigado por confirmar sua participação',
  CONVITE_RECUSADO: 'Convite recusado com sucesso',
  LEMBRETE_ENVIADO: 'Lembrete enviado com sucesso',
  STATUS_ALTERADO_SUCESSO: 'Status alterado com sucesso',
  STATUS_ATUALIZADO_AUTOMATICAMENTE: 'Status atualizado automaticamente',
  AGENDAMENTO_EXCLUIDO_SUCESSO: 'Agendamento excluído com sucesso'
};

module.exports = {
  AGENDAMENTO_STATUS,
  CONVIDADO_STATUS,
  AGENDAMENTO_TIPOS,
  AGENDAMENTO_LIMITS,
  TEMPO_CONFIG,
  USER_ROLES,
  AUTO_APPROVE_ROLES,
  REGEX_PATTERNS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};