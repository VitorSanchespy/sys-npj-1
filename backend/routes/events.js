/**
 * Rotas para o sistema de eventos
 */
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const { canCreateEvent, canApproveRejectEvent, canViewEvent } = require('../middleware/eventMiddleware');
const { body, param, query } = require('express-validator');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Validações para criação de evento
const createEventValidations = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Título deve ter entre 3 e 255 caracteres'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres'),
  
  body('start_at')
    .isISO8601()
    .withMessage('Data de início deve ser uma data válida')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Data de início deve ser no futuro');
      }
      return true;
    }),
  
  body('end_at')
    .isISO8601()
    .withMessage('Data de fim deve ser uma data válida')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.start_at)) {
        throw new Error('Data de fim deve ser posterior à data de início');
      }
      return true;
    }),
  
  body('participants')
    .optional()
    .isArray()
    .withMessage('Participantes deve ser um array'),
  
  body('participants.*.email')
    .optional()
    .isEmail()
    .withMessage('Email do participante deve ser válido')
];

// Validações para parâmetros
const eventIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do evento deve ser um número inteiro positivo')
];

// Validações para rejeição
const rejectEventValidations = [
  ...eventIdValidation,
  body('rejection_reason')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Motivo da rejeição deve ter entre 5 e 500 caracteres')
];

// Validações para consulta
const queryValidations = [
  query('status')
    .optional()
    .isIn(['requested', 'approved', 'rejected', 'canceled', 'completed'])
    .withMessage('Status deve ser: requested, approved, rejected, canceled ou completed'),
  
  query('from_date')
    .optional()
    .isISO8601()
    .withMessage('Data inicial deve ser uma data válida'),
  
  query('to_date')
    .optional()
    .isISO8601()
    .withMessage('Data final deve ser uma data válida'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser entre 1 e 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset deve ser um número não negativo')
];

// Rotas

/**
 * @route POST /api/events
 * @desc Criar nova solicitação de evento
 * @access Usuários autenticados
 */
router.post('/', 
  canCreateEvent,
  createEventValidations,
  eventController.createEvent
);

/**
 * @route GET /api/events
 * @desc Listar eventos do usuário (ou todos se admin/professor)
 * @access Usuários autenticados
 */
router.get('/',
  canViewEvent,
  queryValidations,
  eventController.listEvents
);

/**
 * @route GET /api/events/stats
 * @desc Obter estatísticas de eventos
 * @access Admin e Professores
 */
router.get('/stats',
  canApproveRejectEvent,
  eventController.getEventStats
);

/**
 * @route GET /api/events/:id
 * @desc Obter evento específico por ID
 * @access Usuários autenticados (solicitante, participante, admin, professor)
 */
router.get('/:id',
  canViewEvent,
  eventIdValidation,
  eventController.getEvent
);

/**
 * @route POST /api/events/:id/approve
 * @desc Aprovar evento
 * @access Admin e Professores
 */
router.post('/:id/approve',
  canApproveRejectEvent,
  eventIdValidation,
  eventController.approveEvent
);

/**
 * @route POST /api/events/:id/reject
 * @desc Rejeitar evento
 * @access Admin e Professores
 */
router.post('/:id/reject',
  canApproveRejectEvent,
  rejectEventValidations,
  eventController.rejectEvent
);

/**
 * @route POST /api/events/:id/cancel
 * @desc Cancelar evento
 * @access Solicitante do evento
 */
router.post('/:id/cancel',
  canViewEvent,
  eventIdValidation,
  eventController.cancelEvent
);

module.exports = router;
