const express = require('express');
const router = express.Router();

const verificarToken = require('../middleware/authMiddleware');
const usuarioController = require('../controllers/usuarioController');

// Autenticação obrigatória para todas rotas
router.use(verificarToken);

// Rotas básicas
router.get('/me', usuarioController.me);
router.put('/me', usuarioController.updateMe);
router.put('/me/senha', usuarioController.changePassword);
router.delete('/me', usuarioController.deleteMe);
router.get('/', usuarioController.listarUsuarios);
router.post('/', usuarioController.criarUsuario);
router.get('/para-vinculacao', usuarioController.buscarUsuariosParaVinculacao);
router.get('/:id', usuarioController.obterUsuario);
router.put('/:id', usuarioController.atualizarUsuario);
router.put('/:id/reativar', usuarioController.reativarUsuario);
router.delete('/:id', usuarioController.deletarUsuario);

module.exports = router;
