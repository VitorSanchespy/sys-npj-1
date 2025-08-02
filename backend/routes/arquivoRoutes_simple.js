const express = require('express');
const router = express.Router();

const verificarToken = require('../middleware/authMiddleware');
const arquivoController = require('../controllers/arquivoControllers');

// Aplicar autenticação a todas as rotas
router.use(verificarToken);

// Rotas básicas
router.get('/', arquivoController.listarArquivos);
router.get('/processo/:processoId', arquivoController.listarArquivosPorProcesso);
router.get('/:id', arquivoController.buscarArquivoPorId);
router.delete('/:id', arquivoController.deletarArquivo);

module.exports = router;
