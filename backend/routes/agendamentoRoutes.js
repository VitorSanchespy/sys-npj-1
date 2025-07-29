// Rotas de Agendamentos
const express = require('express');
const router = express.Router();
const agendController = require('../controllers/agendamentoControllers');
const verificarToken = require('../middleware/authMiddleware');

// Aplicar middleware de autenticação em todas as rotas
router.use(verificarToken);

// GET /api/agendamentos - Listar agendamentos
router.get('/', agendController.listarAgendamentos);

// POST /api/agendamentos - Criar agendamento
router.post('/', agendController.criarAgendamento);

// GET /api/agendamentos/:id - Buscar agendamento por ID
router.get('/:id', agendController.buscarAgendamentoPorId);

// PUT /api/agendamentos/:id - Atualizar agendamento
router.put('/:id', agendController.atualizarAgendamento);

// DELETE /api/agendamentos/:id - Deletar agendamento
router.delete('/:id', agendController.excluirAgendamento);

module.exports = router;
