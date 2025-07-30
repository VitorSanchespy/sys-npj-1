const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');
const { validarUsuarioDuplicado } = require('../middleware/antiDuplicacaoMiddleware');

// Importando apenas as funções que existem no controller
const { listarUsuarios, criarUsuario, buscarUsuarioPorId,
atualizarUsuario, excluirUsuario, obterPerfil } = require('../controllers/usuarioControllers.js');

// Aplicar middleware de autenticação a todas as rotas
router.use(verificarToken);

// Rotas básicas de usuário
router.get('/', listarUsuarios);
router.post('/', validarUsuarioDuplicado, criarUsuario);
router.get('/me', obterPerfil);
router.get('/:id', buscarUsuarioPorId);
router.put('/:id', validarUsuarioDuplicado, atualizarUsuario);
router.delete('/:id', excluirUsuario);

module.exports = router;
