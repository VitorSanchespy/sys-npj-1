const express = require('express');
const router = express.Router();

const verificarToken = require('../middleware/authMiddleware');
const usuarioController = require('../controllers/usuarioController');
const { preveniDuplicacaoUsuario } = require('../middleware/antiDuplicacaoMiddleware');
const { validate, handleValidation } = require('../middleware/validationMiddleware');

// Autenticação obrigatória para todas rotas
router.use(verificarToken);

// Rotas básicas - com validação e anti-duplicação
router.get('/me', usuarioController.me);
router.put('/me', validate('updateUsuario'), handleValidation, usuarioController.updateMe);
router.put('/me/senha', validate('updateSenha'), handleValidation, usuarioController.changePassword);
router.delete('/me', usuarioController.deleteMe);
router.get('/', usuarioController.listarUsuarios);
router.post('/', validate('registrarUsuario'), handleValidation, preveniDuplicacaoUsuario, usuarioController.criarUsuario);
router.get('/para-vinculacao', usuarioController.buscarUsuariosParaVinculacao);
router.get('/:id', validate('getUsuario'), handleValidation, usuarioController.obterUsuario);
router.put('/:id', validate('updateUsuario'), handleValidation, preveniDuplicacaoUsuario, usuarioController.atualizarUsuario);
router.put('/:id/reativar', validate('getUsuario'), handleValidation, usuarioController.reativarUsuario);
router.delete('/:id', validate('getUsuario'), handleValidation, usuarioController.deletarUsuario);

module.exports = router;
