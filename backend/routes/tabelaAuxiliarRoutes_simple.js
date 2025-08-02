const express = require('express');
const router = express.Router();

const verificarToken = require('../middleware/authMiddleware');
const tabelaController = require('../controllers/tabelaAuxiliarControllers');

// Aplicar autenticação a todas as rotas
router.use(verificarToken);

// Rotas básicas
router.get('/materias', tabelaController.listarMaterias);
router.get('/fases', tabelaController.listarFases);
router.get('/diligencias', tabelaController.listarDiligencias);
router.get('/locais', tabelaController.listarLocais);

module.exports = router;
