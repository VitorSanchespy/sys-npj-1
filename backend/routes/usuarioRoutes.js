const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware.js'); // Novo middleware para roles
const usuarioController = require('../controllers/usersControllers');
const { validate } = require('../middleware/validationMiddleware'); // Middleware de validação

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

router.get('/', roleMiddleware(['Admin']), usuarioController.listarUsuarios);

router.get(
  '/:id',
  validate('getUsuario'), // Middleware de validação do ID
  usuarioController.buscarUsuarioPorId
);

router.put(
  '/:id',
  validate('updateUsuario'), // Middleware de validação
  usuarioController.atualizarUsuario
);

router.get(
  '/alunos',
  roleMiddleware(['professor', 'admin']),
  usuarioController.listarUsuarios
);


module.exports = router;