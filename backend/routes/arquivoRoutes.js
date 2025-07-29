// Rotas de Arquivos
const express = require('express');
const router = express.Router();
const fileController = require('../controllers/arquivoControllers');
const verificarToken = require('../middleware/authMiddleware');

// Aplicar middleware de autenticação em todas as rotas
router.use(verificarToken);

// POST /api/arquivos/upload - Upload de arquivo
router.post('/upload', fileController.uploadArquivo);

// GET /api/arquivos/processo/:processo_id - Listar arquivos de um processo
router.get('/processo/:processo_id', fileController.listarArquivosPorProcesso);

// GET /api/arquivos/:id - Buscar arquivo por ID
router.get('/:id', fileController.buscarArquivoPorId);

// DELETE /api/arquivos/:id - Deletar arquivo
router.delete('/:id', fileController.deletarArquivo);

module.exports = router;
