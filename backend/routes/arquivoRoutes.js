const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const arquivoController = require('../controllers/arquivoController');

router.post('/upload', 
  authMiddleware,
  arquivoController.uploadArquivo
);

router.get('/processo/:processo_id', 
  authMiddleware,
  arquivoController.listarArquivos
);

module.exports = router;