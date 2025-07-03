const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const usuarioController = require('../controllers/usersControllers');

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

/**
 * @route GET /api/usuarios
 * @desc Listar todos os usuários (apenas admin)
 * @access Private (Admin)
 */
router.get('/', usuarioController.listarUsuarios);

/**
 * @route GET /api/usuarios/:id
 * @desc Obter informações de um usuário específico
 * @access Private
 */
router.get('/:id', usuarioController.buscarUsuario);

/**
 * @route PUT /api/usuarios/:id
 * @desc Atualizar informações do usuário
 * @access Private
 */
router.put('/:id', usuarioController.atualizarUsuario);

/**
 * @route GET /api/usuarios/alunos
 * @desc Listar todos os alunos
 * @access Private (Professor/Admin)
 */
router.get('/alunos', usuarioController.listarAlunos);

module.exports = router;