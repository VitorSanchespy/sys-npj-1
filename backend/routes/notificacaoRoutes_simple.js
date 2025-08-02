const express = require('express');
const router = express.Router();

const verificarToken = require('../middleware/authMiddleware');
const notificacaoController = require('../controllers/notificacaoControllers');

// Aplicar autenticação a todas as rotas
router.use(verificarToken);

// Rotas básicas
router.get('/', notificacaoController.listarNotificacoes);
router.post('/', notificacaoController.criarNotificacao);
router.get('/:id', notificacaoController.obterNotificacao);
router.put('/:id', notificacaoController.atualizarNotificacao);

module.exports = router;
