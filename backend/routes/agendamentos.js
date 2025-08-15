const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController');
const authMiddleware = require('../middleware/authMiddleware');
const { body, param, query } = require('express-validator');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Validações para criação
const validacoesCriacao = [
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
    .withMessage('Local deve ter no máximo 500 caracteres')
];

// Validações para atualização
const validacoesAtualizacao = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número positivo'),
  
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
];

// Validação para ID
const validacaoId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número positivo')
];

// Validação para processo ID
const validacaoProcessoId = [
  param('processoId')
    .isInt({ min: 1 })
    .withMessage('ID do processo deve ser um número positivo')
];

// Rotas

// POST /api/agendamentos - Criar agendamento
router.post('/', validacoesCriacao, agendamentoController.criar);

// GET /api/agendamentos - Listar agendamentos
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('processo_id').optional().isInt({ min: 1 }).withMessage('ID do processo deve ser um número positivo'),
  query('status').optional().isIn(['pendente', 'confirmado', 'concluido', 'cancelado']).withMessage('Status inválido'),
  query('tipo').optional().isIn(['reuniao', 'audiencia', 'prazo', 'outro']).withMessage('Tipo inválido'),
  query('data_inicio').optional().isISO8601().withMessage('Data de início inválida'),
  query('data_fim').optional().isISO8601().withMessage('Data de fim inválida')
], agendamentoController.listar);

// GET /api/agendamentos/:id - Buscar agendamento por ID
router.get('/:id', validacaoId, agendamentoController.buscarPorId);

// PUT /api/agendamentos/:id - Atualizar agendamento
router.put('/:id', validacoesAtualizacao, agendamentoController.atualizar);

// DELETE /api/agendamentos/:id - Deletar agendamento
router.delete('/:id', validacaoId, agendamentoController.deletar);

// GET /api/agendamentos/processo/:processoId - Listar agendamentos por processo
router.get('/processo/:processoId', validacaoProcessoId, agendamentoController.listarPorProcesso);

// PATCH /api/agendamentos/:id/status - Marcar status do agendamento
router.patch('/:id/status', [
  ...validacaoId,
  body('status')
    .isIn(['pendente', 'confirmado', 'concluido', 'cancelado'])
    .withMessage('Status deve ser: pendente, confirmado, concluido ou cancelado')
], agendamentoController.marcarStatus);

// POST /api/agendamentos/:id/lembrete - Enviar lembrete manual
router.post('/:id/lembrete', validacaoId, agendamentoController.enviarLembrete);

// POST /api/agendamentos/:id/aceitar - Aceitar convite para agendamento
router.post('/:id/aceitar', [
  ...validacaoId,
  body('email').optional().isEmail().withMessage('Email deve ter formato válido')
], agendamentoController.aceitarConvite);

// POST /api/agendamentos/:id/recusar - Recusar convite para agendamento
router.post('/:id/recusar', [
  ...validacaoId,
  body('email').optional().isEmail().withMessage('Email deve ter formato válido')
], agendamentoController.recusarConvite);

// GET /api/agendamentos/lembrete/pendentes - Buscar agendamentos pendentes de lembrete
router.get('/lembrete/pendentes', agendamentoController.buscarParaLembrete);

module.exports = router;
