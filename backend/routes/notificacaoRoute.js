const express = require('express');
const router = express.Router();

const verificarToken = require('../middleware/authMiddleware');
const notificacaoController = require('../controllers/notificacaoController');

// Aplicar autenticação a todas as rotas
router.use(verificarToken);

// Rotas básicas
router.get('/', notificacaoController.listarNotificacoes);
router.post('/', notificacaoController.criarNotificacao);
router.get('/usuario', notificacaoController.listarNotificacoesUsuario);
router.get('/nao-lidas/count', notificacaoController.contarNaoLidas);
router.put('/marcar-todas-lidas', notificacaoController.marcarTodasComoLidas);
router.get('/:id', notificacaoController.obterNotificacao);
router.put('/:id/lida', notificacaoController.marcarComoLida);
router.delete('/:id', notificacaoController.deletarNotificacao);

module.exports = router;
