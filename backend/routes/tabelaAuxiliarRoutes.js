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

// GET /api/aux/materia-assunto - Alias para matérias (compatibilidade com testes)
router.get('/materia-assunto', auxController.listarMaterias);

// GET /api/aux/fases - Listar fases
router.get('/fases', auxController.listarFases);
router.get('/fase', auxController.listarFases); // Alias for compatibility

// GET /api/aux/fase - Alias para fases (compatibilidade com testes)
router.get('/fase', auxController.listarFases);

// GET /api/aux/diligencias - Listar diligências
router.get('/diligencias', auxController.listarDiligencias);

// GET /api/aux/diligencia - Alias para diligências (compatibilidade com testes)
router.get('/diligencia', auxController.listarDiligencias);

// GET /api/aux/locais - Listar locais de tramitação
router.get('/locais', auxController.listarLocais);

// GET /api/aux/local-tramitacao - Alias para locais (compatibilidade com testes)
router.get('/local-tramitacao', auxController.listarLocais);

module.exports = router;
