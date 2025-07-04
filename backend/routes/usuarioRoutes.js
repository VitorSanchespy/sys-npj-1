const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware.js'); // Novo middleware para roles
const usuarioController = require('../controllers/usersControllers');
const { validate } = require('../middleware/validationMiddleware'); // Middleware de validação

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
  usuarioController.buscarUsuarioPorId
);

router.put(
  '/:id',
  validate('updateUsuario'),
  usuarioController.atualizarUsuario
);

module.exports = router;