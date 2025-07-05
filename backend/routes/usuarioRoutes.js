const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware.js'); // Novo middleware para roles
const usuarioController = require('../controllers/usersControllers');
const { validate, handleValidation, } = require('../middleware/validationMiddleware'); // Middleware de validação

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

router.get(
  '/alunos',
  roleMiddleware(['Professor', 'Admin']),
  usuarioController.listarAlunos
);

router.get('/', roleMiddleware(['Admin']), usuarioController.listarUsuarios);

router.get(
  '/:id',
  validate('getUsuario'),
  handleValidation,
  usuarioController.buscarUsuarioPorId
);

router.put(
  '/:id',
  validate('updateUsuario'),
  handleValidation,
  usuarioController.atualizarUsuario
);

router.put('/:id/senha', [
  validate('updateSenha'),
  handleValidation,
  usuarioController.atualizarSenha
]);

router.delete('/:id', [
  roleMiddleware(['Professor', 'Admin']),
  usuarioController.deletarUsuario
]);

router.put('/:id/reativar', [
  roleMiddleware(['Admin']),
  usuarioController.reativarUsuario
]);

module.exports = router;