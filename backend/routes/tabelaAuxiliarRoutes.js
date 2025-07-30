// Rotas de Tabelas Auxiliares
const express = require('express');
const router = express.Router();
const auxController = require('../controllers/tabelaAuxiliarControllers');
// const verificarToken = require('../middleware/authMiddleware');

// Aplicar middleware de autenticação em todas as rotas
// router.use(verificarToken);

// GET /api/aux/materias - Listar matérias/assuntos
router.get('/materias', auxController.listarMaterias);
router.get('/materia-assunto', auxController.listarMaterias); // Alias for compatibility

// GET /api/aux/fases - Listar fases
router.get('/fases', auxController.listarFases);
router.get('/fase', auxController.listarFases); // Alias for compatibility

// GET /api/aux/diligencias - Listar diligências
router.get('/diligencias', auxController.listarDiligencias);

// GET /api/aux/locais - Listar locais de tramitação
router.get('/locais', auxController.listarLocais);

module.exports = router;
