const express = require('express');
const router = express.Router();

const verificarToken = require('../middleware/authMiddleware');
const agendamentoControllerLocal = require('../controllers/agendamentoControllerLocal');

// Autenticação obrigatória para todas rotas
router.use(verificarToken);

// Rotas simplificadas para agendamentos locais (teste)
router.get('/', agendamentoControllerLocal.listarAgendamentos);
router.post('/', agendamentoControllerLocal.criarAgendamento);
router.put('/:id', agendamentoControllerLocal.atualizarAgendamento);
router.delete('/:id', agendamentoControllerLocal.deletarAgendamento);
router.get('/estatisticas', agendamentoControllerLocal.estatisticasAgendamentos);

module.exports = router;
