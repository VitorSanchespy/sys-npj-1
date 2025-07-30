// Rotas de Usuários
const express = require('express');
const router = express.Router();
const userController = require('../controllers/usuarioControllers');
const verificarToken = require('../utils/authMiddleware');

// Aplicar middleware de autenticação em todas as rotas
router.use(verificarToken);

// GET /api/usuarios - Listar usuários
router.get('/', userController.listarUsuarios);

// GET /api/usuarios/:id - Buscar usuário por ID
router.get('/:id', userController.buscarUsuarioPorId);

// POST /api/usuarios - Criar usuário
router.post('/', userController.criarUsuario);

// PUT /api/usuarios/:id - Atualizar usuário
router.put('/:id', userController.atualizarUsuario);

// DELETE /api/usuarios/:id - Deletar usuário
router.delete('/:id', userController.excluirUsuario);

module.exports = router;
