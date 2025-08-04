const express = require('express');
const router = express.Router();

const verificarToken = require('../middleware/authMiddleware');
const tabelaController = require('../controllers/tabelaAuxiliarController');

// Aplicar autenticação a todas as rotas
router.use(verificarToken);

// Rotas básicas
router.get('/roles', tabelaController.listarRoles);
router.get('/status', tabelaController.listarStatus);
router.get('/tipos-acao', tabelaController.listarTiposAcao);
router.get('/materia-assunto', tabelaController.listarMateriaAssunto);
router.post('/materia-assunto', tabelaController.criarMateriaAssunto);
router.get('/fases', tabelaController.listarFases);
router.post('/fases', tabelaController.criarFase);
router.get('/diligencias', tabelaController.listarDiligencias);
router.post('/diligencias', tabelaController.criarDiligencia);
router.get('/locais-tramitacao', tabelaController.listarLocaisTramitacao);
router.post('/locais-tramitacao', tabelaController.criarLocalTramitacao);
// Adicione aqui apenas rotas cujos controllers existem

module.exports = router;
