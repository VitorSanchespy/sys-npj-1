const express = require('express');
const router = express.Router();
const processUpdatesController = require('../controllers/atualizacaoProcessoControllers');
const authMiddleware = require('../middleware/authMiddleware');
const { listar } = require('../controllers/tabelaAuxiliarControllers');
const { adicionarAtualizacaoProcessos, 
    removerAtualizacaoProcessos, listarAtualizacaoProcesso} = require
    ('../controllers/atualizacaoProcessoControllers');

// Listar atualizações de um processo
router.get('/:processo_id', authMiddleware, listarAtualizacaoProcesso);
// Criar atualização
router.post('/', authMiddleware, adicionarAtualizacaoProcessos);
// Remover atualização
router.delete('/:processo_id/atualizacoes/:atualizacao_id', 
    authMiddleware, removerAtualizacaoProcessos);

module.exports = router;
