const express = require('express');
const router = express.Router();
const agendamentoControllers = require('../controllers/agendamentoControllers');
const verificarToken = require('../middleware/authMiddleware');

// Aplicar autenticação a todas as rotas
router.use(verificarToken);

// Rotas básicas
router.get('/', agendamentoControllers.listarAgendamentos);
router.post('/', agendamentoControllers.criarAgendamento);
router.get('/usuario', agendamentoControllers.listarAgendamentosUsuario);
router.get('/periodo', agendamentoControllers.listarAgendamentosPeriodo);
router.get('/:id', agendamentoControllers.obterAgendamento);
router.put('/:id', agendamentoControllers.atualizarAgendamento);
router.delete('/:id', agendamentoControllers.deletarAgendamento);

module.exports = router;
