const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoProcessoController');
const authMiddleware = require('../middleware/authMiddleware');
const { validate, handleValidation } = require('../middleware/validationMiddleware');
const { check } = require('express-validator');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Validações para agendamentos globais
const updateAgendamentoValidation = [
  check('start').optional().isISO8601().withMessage('Data de início deve ser válida'),
  check('end').optional().isISO8601().withMessage('Data de fim deve ser válida'),
  check('summary').optional().isString().trim(),
  check('tipo_evento').optional().isString().trim(),
  handleValidation
];

/**
 * @route GET /agendamentos
 * @desc Listar todos os agendamentos do sistema
 * @access Private
 * @query {number} page - Página (default: 1)
 * @query {number} limit - Itens por página (default: 20)
 * @query {string} status - Filtrar por status
 * @query {string} tipo_evento - Filtrar por tipo de evento
 */
router.get('/', agendamentoController.listAll);

/**
 * @route GET /agendamentos/:id
 * @desc Buscar agendamento específico
 * @access Private
 */
router.get('/:id', agendamentoController.getById);

/**
 * @route PUT /agendamentos/:id
 * @desc Atualizar agendamento existente
 * @access Private
 */
router.put('/:id', updateAgendamentoValidation, agendamentoController.update);

/**
 * @route DELETE /agendamentos/:id
 * @desc Cancelar agendamento
 * @access Private
 */
router.delete('/:id', agendamentoController.remove);

/**
 * @route POST /agendamentos/:id/sync
 * @desc Sincronizar agendamento pendente com Google Calendar
 * @access Private
 */
router.post('/:id/sync', agendamentoController.sync);

module.exports = router;
