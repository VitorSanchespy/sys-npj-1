const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController');
const verificarToken = require('../middleware/authMiddleware');

// Aplicar autenticação a todas as rotas
router.use(verificarToken);

// Rotas básicas
router.get('/', agendamentoController.listarAgendamentos);
router.post('/', agendamentoController.criarAgendamento);
router.get('/usuario', agendamentoController.listarAgendamentosUsuario);
router.get('/periodo', agendamentoController.listarAgendamentosPeriodo);
router.get('/:id', agendamentoController.obterAgendamento);
router.put('/:id', agendamentoController.atualizarAgendamento);
router.delete('/:id', agendamentoController.deletarAgendamento);

module.exports = router;
