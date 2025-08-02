const express = require('express');
const router = express.Router();

const verificarToken = require('../middleware/authMiddleware');
const processoController = require('../controllers/processoController');

// Autenticação obrigatória para todas rotas
router.use(verificarToken);

// Rotas básicas
router.get('/', processoController.listarProcessos);
router.post('/', processoController.criarProcesso);
router.get('/usuario', processoController.listarProcessosUsuario);
router.get('/:id', processoController.obterProcesso);
router.put('/:id', processoController.atualizarProcesso);
router.delete('/:id', processoController.deletarProcesso);

module.exports = router;
