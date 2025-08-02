const express = require('express');
const router = express.Router();

const verificarToken = require('../middleware/authMiddleware');
const atualizacaoController = require('../controllers/atualizacaoProcessoControllers');

// Aplicar autenticação a todas as rotas
router.use(verificarToken);

// Rotas básicas
router.get('/', atualizacaoController.listarTodasAtualizacoes);
router.post('/', atualizacaoController.adicionarAtualizacaoProcessos);
router.get('/:processoId', atualizacaoController.listarAtualizacaoProcesso);
router.delete('/:id', atualizacaoController.removerAtualizacaoProcessos);

module.exports = router;
