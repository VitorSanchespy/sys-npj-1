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

const createAgendamentoValidation = [
  // Aceitar processo_id ou processoId
  check('processo_id').optional().isInt().withMessage('ID do processo deve ser um número'),
  check('processoId').optional().isInt().withMessage('ID do processo deve ser um número'),
  // Aceitar diferentes formatos de data
  check('start').optional().isISO8601().withMessage('Data de início deve ser válida'),
  check('dataInicio').optional().isISO8601().withMessage('Data de início deve ser válida'),
  check('data_inicio').optional().isISO8601().withMessage('Data de início deve ser válida'),
  check('dataEvento').optional().isISO8601().withMessage('Data do evento deve ser válida'),
  check('data_evento').optional().isISO8601().withMessage('Data do evento deve ser válida'),
  check('end').optional().isISO8601().withMessage('Data de fim deve ser válida'),
  check('dataFim').optional().isISO8601().withMessage('Data de fim deve ser válida'),
  check('data_fim').optional().isISO8601().withMessage('Data de fim deve ser válida'),
  // Campos opcionais
  check('summary').optional().isString().trim(),
  check('titulo').optional().isString().trim(),
  check('tipo_evento').optional().isString().trim(),
  check('tipoEvento').optional().isString().trim(),
  check('description').optional().isString().trim(),
  check('descricao').optional().isString().trim(),
  check('location').optional().isString().trim(),
  check('local').optional().isString().trim(),
  handleValidation
];

/**
 * @route POST /agendamentos
 * @desc Criar novo agendamento global
 * @access Private
 */
router.post('/', createAgendamentoValidation, agendamentoController.createGlobal);


/**
 * @route GET /agendamentos/processos-disponiveis
 * @desc Listar processos disponíveis para agendamento (não concluídos)
 * @access Private
 */
router.get('/processos-disponiveis', agendamentoController.listarProcessosDisponiveis);

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
