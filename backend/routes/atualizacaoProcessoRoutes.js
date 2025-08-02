const express = require('express');
const router = express.Router();

const verificarToken = require('../middleware/authMiddleware');
const atualizacaoController = require('../controllers/atualizacaoProcessoControllers');

// Aplicar autenticação a todas as rotas
router.use(verificarToken);

// Rotas básicas
router.get('/', atualizacaoController.listarAtualizacoes);
router.post('/', atualizacaoController.criarAtualizacao);
router.get('/:id', atualizacaoController.obterAtualizacao);
router.put('/:id', atualizacaoController.atualizarAtualizacao);
router.delete('/:id', atualizacaoController.deletarAtualizacao);

module.exports = router;
