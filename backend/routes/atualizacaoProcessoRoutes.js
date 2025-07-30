const express = require('express');
const router = express.Router();
const processUpdatesController = require('../controllers/atualizacaoProcessoControllers');
const { verificarToken } = require('../middleware/authMiddleware');
const { listar } = require('../controllers/tabelaAuxiliarControllers');
const { adicionarAtualizacaoProcessos, 
    removerAtualizacaoProcessos, listarAtualizacaoProcesso, listarTodasAtualizacoes} = require
    ('../controllers/atualizacaoProcessoControllers');

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
