const express = require('express');
const router = express.Router();

const verificarToken = require('../middleware/authMiddleware');
const tabelaController = require('../controllers/tabelaAuxiliarController');

// Aplicar autenticação a todas as rotas
router.use(verificarToken);

// Rotas básicas
router.get('/todas', tabelaController.obterTodasOpcoes);
router.get('/roles', tabelaController.listarRoles);
router.get('/tipos-acao', tabelaController.listarTiposAcao);
router.get('/status', tabelaController.listarStatusProcesso);
router.get('/prioridades', tabelaController.listarPrioridades);
router.get('/comarcas', tabelaController.listarComarcas);
router.get('/varas', tabelaController.listarVaras);

module.exports = router;
