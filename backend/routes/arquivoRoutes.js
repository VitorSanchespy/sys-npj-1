const express = require('express');
const router = express.Router();

const verificarToken = require('../middleware/authMiddleware');
const arquivoController = require('../controllers/arquivoControllers');

// Aplicar autenticação a todas as rotas
router.use(verificarToken);

// Rotas básicas
router.get('/', arquivoController.listarArquivos);
router.post('/upload', arquivoController.uploadArquivo);
router.get('/:id', arquivoController.obterArquivo);
router.get('/:id/download', arquivoController.downloadArquivo);
router.delete('/:id', arquivoController.deletarArquivo);

module.exports = router;
