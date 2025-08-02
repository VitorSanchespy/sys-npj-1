const express = require('express');
const router = express.Router();

const verificarToken = require('../middleware/authMiddleware');
const usuarioController = require('../controllers/usuarioControllers');

// Autenticação obrigatória para todas rotas
router.use(verificarToken);

// Rotas básicas
router.get('/', usuarioController.listarUsuarios);
router.post('/', usuarioController.criarUsuario);
router.get('/:id', usuarioController.obterUsuario);
router.put('/:id', usuarioController.atualizarUsuario);
router.delete('/:id', usuarioController.deletarUsuario);

module.exports = router;