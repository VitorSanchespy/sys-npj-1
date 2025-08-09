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
router.get('/estatisticas', agendamentoController.obterEstatisticas);
router.get('/:id', agendamentoController.obterAgendamento);
router.put('/:id', agendamentoController.atualizarAgendamento);
router.delete('/:id', agendamentoController.deletarAgendamento);
router.post('/:id/sincronizar-google', agendamentoController.sincronizarGoogleCalendar);

module.exports = router;
