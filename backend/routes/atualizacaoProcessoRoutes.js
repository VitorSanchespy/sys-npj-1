const express = require('express');
const router = express.Router();
const processUpdatesController = require('../controllers/atualizacaoProcessoControllers');
const authMiddleware = require('../middleware/authMiddleware');

// Listar atualizações de um processo
router.get('/:processo_id', authMiddleware, processUpdatesController.listUpdates);
// Criar atualização
router.post('/', authMiddleware, processUpdatesController.createUpdate);

module.exports = router;
