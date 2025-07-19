const express = require('express');
const router = express.Router();
const { addLocalTramitacao, getLocalTramitacoes } = require('../controllers/localTramitacaoControllers');
const authMiddleware = require('../middleware/authMiddleware');

// Rota para obter todos os locais de tramitação
router.get('/', authMiddleware, getLocalTramitacoes);

// Rota para adicionar um novo local de tramitação
router.post('/', authMiddleware, addLocalTramitacao);

module.exports = router;
