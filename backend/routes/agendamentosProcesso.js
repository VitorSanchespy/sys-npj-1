const express = require('express');
const router = express.Router({ mergeParams: true });
const agendamentoController = require('../controllers/agendamentoProcessoController');
const authMiddleware = require('../middleware/authMiddleware');
const { validate, handleValidation } = require('../middleware/validationMiddleware');
const { check } = require('express-validator');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Validações customizadas para agendamentos
const createAgendamentoValidation = [
  check('start')
    .notEmpty()
    .withMessage('O campo "start" é obrigatório.')
    .custom((value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('O campo "start" deve ser uma data/hora válida.');
      }
      return true;
    }),
  check('end')
    .notEmpty()
    .withMessage('O campo "end" é obrigatório.')
    .custom((value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('O campo "end" deve ser uma data/hora válida.');
      }
      return true;
    }),
  check('summary')
    .optional()
    .isString()
    .trim()
    .withMessage('O campo "summary" deve ser uma string.'),
  handleValidation
];

const updateAgendamentoValidation = [
  check('start').optional().isISO8601().withMessage('Data de início deve ser válida'),
  check('end').optional().isISO8601().withMessage('Data de fim deve ser válida'),
  check('summary').optional().isString().trim(),
  handleValidation
];

/**
 * @route GET /processos/:processoId/agendamentos
 * @desc Listar todos os agendamentos de um processo
 * @access Private
 * @query {number} page - Página (default: 1)
 * @query {number} limit - Itens por página (default: 10)
 * @query {string} status - Filtrar por status (pendente|sincronizado|cancelado)
 */
router.get('/', agendamentoController.listByProcesso);

/**
 * @route POST /processos/:processoId/agendamentos
 * @desc Criar novo agendamento para um processo
 * @access Private
 * @body {string} start - Data/hora de início (ISO string)
 * @body {string} end - Data/hora de fim (ISO string)
 * @body {string} [summary] - Título do agendamento
 * @body {string} [description] - Descrição do agendamento
 * @body {string} [location] - Local do agendamento
 */
router.post('/', createAgendamentoValidation, agendamentoController.create);

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
 * @body {string} [start] - Nova data/hora de início
 * @body {string} [end] - Nova data/hora de fim
 * @body {string} [summary] - Novo título
 * @body {string} [description] - Nova descrição
 * @body {string} [location] - Novo local
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
