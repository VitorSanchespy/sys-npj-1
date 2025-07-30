const express = require('express');
const router = express.Router();
const agendamentoControllers = require('../controllers/agendamentoControllers');
const { verificarToken } = require('../middleware/authMiddleware');
const { validarAgendamentoDuplicado } = require('../middleware/antiDuplicacaoMiddleware');

// Rotas simplificadas
router.get('/', verificarToken, agendamentoControllers.listarAgendamentos);
router.post('/', verificarToken, validarAgendamentoDuplicado, agendamentoControllers.criarAgendamento);
router.put('/:id', verificarToken, validarAgendamentoDuplicado, agendamentoControllers.atualizarAgendamento);
router.delete('/:id', verificarToken, agendamentoControllers.excluirAgendamento);
router.get('/:id', verificarToken, agendamentoControllers.buscarAgendamentoPorId);

module.exports = router;
