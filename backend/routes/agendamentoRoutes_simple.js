const express = require('express');
const router = express.Router();
const agendamentoControllers = require('../controllers/agendamentoControllers');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas simplificadas
router.get('/', authMiddleware, agendamentoControllers.listarAgendamentos);
router.post('/', authMiddleware, agendamentoControllers.criarAgendamento);
router.put('/:id', authMiddleware, agendamentoControllers.atualizarAgendamento);
router.delete('/:id', authMiddleware, agendamentoControllers.excluirAgendamento);
router.get('/:id', authMiddleware, agendamentoControllers.buscarAgendamentoPorId);

module.exports = router;
