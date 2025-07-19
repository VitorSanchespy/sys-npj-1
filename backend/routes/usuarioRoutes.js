
const express = require('express');
const router = express.Router();
const { listarUsuarios, criarUsuario, buscarUsuarioPorId,
atualizarUsuario, reativarUsuario, softDeleteUsuario, 
reactivateUsuario, listarUsuariosDebug, 
atualizarSenha, listarAlunos, listarAlunosParaAtribuicao } = require('../controllers/usuarioControllers.js');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware.js'); // Novo middleware para roles
const usuarioController = require('../controllers/usuarioControllers.js');
const { validate, handleValidation, } = require('../middleware/validationMiddleware'); // Middleware de validação

// Soft delete usuário
router.patch('/usuarios/:id/soft-delete', softDeleteUsuario);
// Reativar usuário
router.patch('/usuarios/:id/reactivate', reactivateUsuario);

// Endpoint temporário para depuração
router.get('/debug/all', listarUsuariosDebug);

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

/**
 * @swagger
 * /api/usuarios/alunos:
 *   get:
 *     summary: Lista todos os alunos (apenas Professor/Admin)
 *     tags: [Usuários]
 */
router.get(
  '/alunos',
  roleMiddleware(['Professor', 'Admin']),
  usuarioController.listarAlunos
);

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Lista todos os usuários (apenas Admin)
 *     tags: [Usuários]
 */
router.get('/', roleMiddleware(['Admin']), usuarioController.listarUsuarios);

router.get('/alunos/para-atribuicao', roleMiddleware(['Professor']),  usuarioController.listarAlunosParaAtribuicao
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Busca usuário por ID
 *     tags: [Usuários]
 */
router.get(
  '/:id',
  validate('getUsuario'),
  handleValidation,
  usuarioController.buscarUsuarioPorId
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Atualiza usuário
 *     tags: [Usuários]
 */
router.put(
  '/:id',
  validate('updateUsuario'),
  handleValidation,
  usuarioController.atualizarUsuario
);

/**
 * @swagger
 * /api/usuarios/{id}/senha:
 *   put:
 *     summary: Atualiza senha
 *     tags: [Usuários]
 */
router.put('/:id/senha', [
  validate('updateSenha'),
  handleValidation,
  usuarioController.atualizarSenha
]);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Desativa usuário (soft delete)
 *     tags: [Usuários]
 */
router.delete('/:id', [
  roleMiddleware(['Professor', 'Admin']),
  usuarioController.softDeleteUsuario
]);

/**
 * @swagger
 * /api/usuarios/{id}/reativar:
 *   put:
 *     summary: Reativa usuário
 *     tags: [Usuários]
 */
router.put('/:id/reativar', [
  roleMiddleware(['Admin']),
  usuarioController.reativarUsuario
]);

module.exports = router;