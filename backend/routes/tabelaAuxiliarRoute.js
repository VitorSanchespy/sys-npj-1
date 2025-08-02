const express = require('express');
const router = express.Router();

const verificarToken = require('../middleware/authMiddleware');
const tabelaController = require('../controllers/tabelaAuxiliarController');

// Aplicar autenticação a todas as rotas
router.use(verificarToken);

// Rotas básicas
router.get('/roles', tabelaController.listarRoles);
// Adicione aqui apenas rotas cujos controllers existem

module.exports = router;
