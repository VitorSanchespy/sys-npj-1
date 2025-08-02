const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');
const {
  adicionarAtualizacaoProcessos,
  removerAtualizacaoProcessos,
  listarAtualizacaoProcesso,
  listarTodasAtualizacoes
} = require('../controllers/atualizacaoProcessoControllers');
const processUpdatesController = require('../controllers/atualizacaoProcessoControllers');

// Listar todas as atualizações (para dashboard)
router.get('/', verificarToken, listarTodasAtualizacoes);
// Listar atualizações de um processo
router.get('/:processo_id', verificarToken, listarAtualizacaoProcesso);
// Criar atualização
router.post('/', verificarToken, adicionarAtualizacaoProcessos);
// Remover atualização
router.delete('/:processo_id/atualizacoes/:atualizacao_id', 
    verificarToken, removerAtualizacaoProcessos);

module.exports = router;

