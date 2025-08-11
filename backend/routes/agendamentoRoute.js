const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController');
const verificarToken = require('../middleware/authMiddleware');
const { preveniDuplicacaoAgendamento } = require('../middleware/antiDuplicacaoMiddleware');
const { validate, handleValidation } = require('../middleware/validationMiddleware');

// Aplicar autenticação a todas as rotas
router.use(verificarToken);

// Rotas para agendamentos individuais via Google Calendar
router.get('/', agendamentoController.listarAgendamentos);
router.post('/', preveniDuplicacaoAgendamento, agendamentoController.criarAgendamento);
router.get('/usuario', agendamentoController.listarAgendamentosUsuario);
router.get('/periodo', agendamentoController.listarAgendamentosPeriodo);
router.get('/estatisticas', agendamentoController.obterEstatisticas);
router.post('/invalidar-cache', agendamentoController.invalidarCache);
router.get('/verificar-conexao', agendamentoController.verificarConexao);
router.get('/:id', agendamentoController.obterAgendamento);
router.put('/:id', preveniDuplicacaoAgendamento, agendamentoController.atualizarAgendamento);
router.delete('/:id', agendamentoController.deletarAgendamento);
router.post('/:id/sincronizar-google', agendamentoController.sincronizarGoogleCalendar);

module.exports = router;
