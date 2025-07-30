const express = require('express');
const router = express.Router();
const agendamentoControllers = require('../controllers/agendamentoControllers');
const { verificarToken } = require('../middleware/authMiddleware');

// Rotas simplificadas
router.get('/', verificarToken, agendamentoControllers.listarAgendamentos);
router.post('/', verificarToken, agendamentoControllers.criarAgendamento);
router.put('/:id', verificarToken, agendamentoControllers.atualizarAgendamento);
router.delete('/:id', verificarToken, agendamentoControllers.excluirAgendamento);
router.get('/:id', verificarToken, agendamentoControllers.buscarAgendamentoPorId);

module.exports = router;
