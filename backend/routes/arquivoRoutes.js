const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');
const arquivoController = require('../controllers/arquivoControllers');


router.post('/upload', 
  verificarToken,
  arquivoController.uploadArquivo
);
// Listar arquivos anexados a um processo
router.get('/processo/:processo_id', 
  verificarToken,
  arquivoController.listarArquivos
);

// Listar arquivos enviados por um usuário
router.get('/usuario/:usuario_id', 
  verificarToken,
  arquivoController.listarArquivosUsuario
);

// Anexar arquivo já enviado a um processo
router.post('/anexar', 
  verificarToken,
  arquivoController.anexarArquivoExistente
);

// Soft delete de arquivo
router.delete('/:id', verificarToken, arquivoController.softDeleteArquivo);

// Rota para desvincular arquivo de um processo
router.put('/desvincular/:id', verificarToken, arquivoController.desvincularArquivo);



module.exports = router;