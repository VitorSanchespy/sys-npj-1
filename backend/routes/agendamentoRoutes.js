const express = require('express');
const router = express.Router();
const agendamentoControllers = require('../controllers/agendamentoControllers');
const verificarToken = require('../middleware/authMiddleware');

// Aplicar autenticação a todas as rotas
router.use(verificarToken);

// Rotas simplificadas
router.get('/', agendamentoControllers.listarAgendamentos);
router.post('/', agendamentoControllers.criarAgendamento);
router.get('/:id', agendamentoControllers.obterAgendamento);
router.put('/:id', agendamentoControllers.atualizarAgendamento);

module.exports = router;
