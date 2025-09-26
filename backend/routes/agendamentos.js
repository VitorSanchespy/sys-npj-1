/**
 * Rotas Híbridas para Sistema de Agendamentos
 * Permite alternar entre controllers monolítico e modular via configuração
 */

const express = require('express');
const router = express.Router();

// Middleware de integração
const { createMappedHandler, createRouteHandler, getUseModularControllers } = require('../middleware/integrationMiddleware');

// Middleware padrão
const authMiddleware = require('../middleware/authMiddleware');
const { preveniDuplicacaoAgendamento } = require('../middleware/antiDuplicacaoMiddleware');
const { body, param, query } = require('express-validator');

// Controllers (para referência direta quando necessário)
const agendamentoStatsController = require('../controllers/agendamentoStatsController');

console.log(`🔄 Sistema de Agendamentos iniciando em modo: ${getUseModularControllers() ? 'MODULAR' : 'MONOLÍTICO'}`);

// ========== ROTAS PÚBLICAS (SEM AUTENTICAÇÃO) ==========

// Resposta a convites públicos
router.post('/:id/aceitar-publico', [
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número positivo'),
  body('email').isEmail().withMessage('Email deve ter formato válido')
], ...createMappedHandler('aceitarConvitePublico'));

router.post('/:id/recusar-publico', [
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número positivo'),
  body('email').isEmail().withMessage('Email deve ter formato válido'),
  body('motivo').optional().isLength({ min: 3 }).withMessage('Motivo deve ter pelo menos 3 caracteres')
], ...createMappedHandler('recusarConvitePublico'));

// ========== MIDDLEWARE DE AUTENTICAÇÃO ==========
router.use(authMiddleware);

// ========== ROTAS DE ESTATÍSTICAS (SEMPRE DIRETAS) ==========

// GET /api/agendamentos/filtros - Obter opções de filtros
router.get('/filtros', ...createMappedHandler('obterFiltros'));

// GET /api/agendamentos/stats - Estatísticas gerais
router.get('/stats', agendamentoStatsController.getStats);

// GET /api/agendamentos/stats/convites - Estatísticas de convites
router.get('/stats/convites', agendamentoStatsController.getConviteStats);

// GET /api/agendamentos/lembrete/pendentes - Buscar agendamentos pendentes de lembrete
router.get('/lembrete/pendentes', ...createMappedHandler('buscarParaLembrete'));

// ========== ROTAS DE GESTÃO BÁSICA (CRUD) ==========

// POST /api/agendamentos - Criar agendamento
router.post('/', [
  body('titulo')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Título deve ter entre 3 e 255 caracteres'),
  
  body('data_inicio')
    .isISO8601()
    .withMessage('Data de início deve ser uma data válida'),
  
  body('data_fim')
    .isISO8601()
    .withMessage('Data de fim deve ser uma data válida'),
  
  body('tipo')
    .optional()
    .isIn(['reuniao', 'audiencia', 'prazo', 'outro'])
    .withMessage('Tipo deve ser: reuniao, audiencia, prazo ou outro'),
  
  body('email_lembrete')
    .optional()
    .isEmail()
    .withMessage('Email deve ter formato válido'),
  
  body('convidados')
    .optional()
    .isArray()
    .withMessage('Convidados deve ser um array'),
  
  body('convidados.*.email')
    .optional()
    .isEmail()
    .withMessage('Email do convidado deve ter formato válido'),
  
  body('local')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Local deve ter no máximo 500 caracteres'),
    
  preveniDuplicacaoAgendamento
], ...createMappedHandler('criar'));

// GET /api/agendamentos - Listar agendamentos
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('processo_id').optional().isInt({ min: 1 }).withMessage('ID do processo deve ser um número positivo'),
  query('status').optional().isIn(['em_analise', 'enviando_convites', 'marcado', 'cancelado', 'finalizado']).withMessage('Status inválido'),
  query('tipo').optional().isIn(['reuniao', 'audiencia', 'prazo', 'outro']).withMessage('Tipo inválido'),
  query('data_inicio').optional().isISO8601().withMessage('Data de início inválida'),
  query('data_fim').optional().isISO8601().withMessage('Data de fim inválida'),
  query('meus_agendamentos').optional().isBoolean().withMessage('Meus agendamentos deve ser true/false')
], ...createMappedHandler('listar'));

// GET /api/agendamentos/:id - Buscar agendamento por ID
router.get('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número positivo')
], ...createMappedHandler('buscarPorId'));

// PUT /api/agendamentos/:id - Atualizar agendamento
router.put('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número positivo'),
  
  body('titulo')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Título deve ter entre 3 e 255 caracteres'),
  
  body('data_inicio')
    .optional()
    .isISO8601()
    .withMessage('Data de início deve ser uma data válida'),
  
  body('data_fim')
    .optional()
    .isISO8601()
    .withMessage('Data de fim deve ser uma data válida'),
  
  body('tipo')
    .optional()
    .isIn(['reuniao', 'audiencia', 'prazo', 'outro'])
    .withMessage('Tipo deve ser: reuniao, audiencia, prazo ou outro'),
  
  body('status')
    .optional()
    .isIn(['pendente', 'confirmado', 'concluido', 'cancelado'])
    .withMessage('Status deve ser: pendente, confirmado, concluido ou cancelado'),
  
  body('email_lembrete')
    .optional()
    .isEmail()
    .withMessage('Email deve ter formato válido'),
  
  body('convidados')
    .optional()
    .isArray()
    .withMessage('Convidados deve ser um array'),
  
  body('convidados.*.email')
    .optional()
    .isEmail()
    .withMessage('Email do convidado deve ter formato válido'),
  
  body('local')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Local deve ter no máximo 500 caracteres')
], ...createMappedHandler('atualizar'));

// DELETE /api/agendamentos/:id - Excluir agendamento
router.delete('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número positivo')
], ...createMappedHandler('deletar'));

// ========== ROTAS DE GERENCIAMENTO DE STATUS ==========

// PATCH /api/agendamentos/:id/status - Alterar status do agendamento
router.patch('/:id/status', [
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número positivo'),
  body('status')
    .isIn(['pendente', 'confirmado', 'concluido', 'cancelado'])
    .withMessage('Status deve ser: pendente, confirmado, concluido ou cancelado')
], ...createMappedHandler('marcarStatus'));

// ========== ROTAS DE GERENCIAMENTO DE CONVITES ==========

// POST /api/agendamentos/:id/aceitar - Aceitar convite (autenticado)
router.post('/:id/aceitar', [
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número positivo'),
  body('email').optional().isEmail().withMessage('Email deve ter formato válido')
], ...createMappedHandler('aceitarConvite'));

// POST /api/agendamentos/:id/recusar - Recusar convite (autenticado)
router.post('/:id/recusar', [
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número positivo'),
  body('email').optional().isEmail().withMessage('Email deve ter formato válido')
], ...createMappedHandler('recusarConvite'));

// ========== ROTAS ESPECÍFICAS (SEMPRE MONOLÍTICAS POR ORA) ==========

// GET /api/agendamentos/processo/:processoId - Listar agendamentos por processo
router.get('/processo/:processoId', [
  param('processoId').isInt({ min: 1 }).withMessage('ID do processo deve ser um número positivo')
], ...createMappedHandler('listarPorProcesso'));

// POST /api/agendamentos/:id/lembrete - Enviar lembrete manual
router.post('/:id/lembrete', [
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número positivo')
], ...createMappedHandler('enviarLembrete'));

// ========== ROTAS ADMINISTRATIVAS ==========

// POST /api/agendamentos/:id/aprovar - Aprovar agendamento
router.post('/:id/aprovar', [
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número positivo'),
  body('observacoes').optional().isLength({ max: 1000 }).withMessage('Observações devem ter no máximo 1000 caracteres')
], ...createMappedHandler('aprovar'));

// POST /api/agendamentos/:id/recusar - Recusar agendamento (Admin)
router.post('/:id/recusar', [
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número positivo'),
  body('motivo_recusa').notEmpty().withMessage('Motivo da recusa é obrigatório')
    .isLength({ min: 10, max: 1000 }).withMessage('Motivo deve ter entre 10 e 1000 caracteres')
], ...createMappedHandler('recusar'));

// POST /api/agendamentos/:id/cancelar - Cancelar agendamento
router.post('/:id/cancelar', [
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número positivo'),
  body('motivo').optional().isLength({ max: 1000 }).withMessage('Motivo deve ter no máximo 1000 caracteres')
], ...createMappedHandler('cancelarAgendamento'));

// POST /api/agendamentos/verificar-status - Verificar status automaticamente
router.post('/verificar-status', ...createMappedHandler('verificarStatusAgendamentos'));

// POST /api/agendamentos/:id/confirmar-misto - Confirmar agendamento com situação mista
router.post('/:id/confirmar-misto', [
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número positivo'),
  body('decisao').isIn(['confirmar', 'cancelar']).withMessage('Decisão deve ser "confirmar" ou "cancelar"'),
  body('observacoes').optional().isLength({ min: 3 }).withMessage('Observações devem ter pelo menos 3 caracteres')
], ...createMappedHandler('confirmarAgendamentoMisto'));

// ========== ROTAS MODULARIZADAS ESPECÍFICAS (QUANDO EM MODO MODULAR) ==========

if (getUseModularControllers()) {
  console.log('📦 Registrando rotas modularizadas específicas...');
  
  // GET /api/agendamentos/:id/historico - Consultar histórico de status
  router.get('/:id/historico', [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número positivo')
  ], ...createRouteHandler('status', 'consultarHistorico'));

  // GET /api/agendamentos/:id/transicoes - Consultar transições disponíveis
  router.get('/:id/transicoes', [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número positivo')
  ], ...createRouteHandler('status', 'consultarTransicoesDisponiveis'));

  // POST /api/agendamentos/status/automatico - Atualizar status automaticamente
  router.post('/status/automatico', ...createRouteHandler('status', 'atualizarStatusAutomatico'));

  // POST /api/agendamentos/:id/convites/enviar - Enviar convites
  router.post('/:id/convites/enviar', [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número positivo'),
    body('emails').optional().isArray().withMessage('Emails deve ser um array'),
    body('emails.*').optional().isEmail().withMessage('Email deve ter formato válido')
  ], ...createRouteHandler('convites', 'enviarConvites'));

  // POST /api/agendamentos/:id/convites/reenviar - Reenviar convites
  router.post('/:id/convites/reenviar', [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número positivo'),
    body('emails').optional().isArray().withMessage('Emails deve ser um array'),
    body('emails.*').optional().isEmail().withMessage('Email deve ter formato válido')
  ], ...createRouteHandler('convites', 'reenviarConvites'));

  // GET /api/agendamentos/:id/convites/status - Status dos convites
  router.get('/:id/convites/status', [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número positivo')
  ], ...createRouteHandler('convites', 'getStatusConvites'));
  
  console.log('✅ Rotas modularizadas específicas registradas');
}

module.exports = router;