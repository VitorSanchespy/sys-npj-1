// Rotas de Usuários
const express = require('express');
const router = express.Router();
const userController = require('../controllers/usuarioControllers');
const authMiddleware = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const { validate, handleValidation } = require('../middleware/validationMiddleware');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Endpoint temporário para depuração
router.get('/debug/all', userController.listarUsuarios);

// Rotas de perfil do usuário autenticado (devem vir antes das rotas com :id)
router.get('/me', userController.obterPerfil);
router.put('/me', userController.atualizarPerfilProprio);
router.put('/me/senha', userController.atualizarSenha);
router.delete('/me', userController.deletarUsuario);

// Contar total de usuários (para dashboard)
router.get('/count', roleMiddleware(['Admin']), userController.contarUsuarios);

// Listar paginação de usuários
router.get('/pagina', roleMiddleware(['Admin']), userController.listarUsuarios);

// Lista todos os usuários (para admin) ou apenas alunos (para professor)
router.get('/', roleMiddleware(['Admin', 'Professor']), (req, res, next) => {
  if (req.user && req.user.role_id === 3) { // Professor
    req.params.roleName = 'Aluno';
    return userController.listarUsuariosPorRole(req, res, next);
  }
  return userController.listarUsuarios(req, res, next);
});

// Lista apenas alunos (para professor)
router.get('/alunos', roleMiddleware(['Professor', 'Admin']), (req, res) => {
  req.params.roleName = 'Aluno';
  return userController.listarUsuariosPorRole(req, res);
});

// Lista usuários para vinculação ao processo
router.get('/vincular', roleMiddleware(['Professor', 'Admin']), userController.listarUsuarios);

// Listar usuários por role
router.get('/role/:roleName', roleMiddleware(['Professor', 'Admin']), userController.listarUsuariosPorRole);

// Buscar usuário por ID
router.get('/:id', 
  validate('getUsuario'),
  handleValidation,
  userController.buscarUsuarioPorId
);

// Soft delete usuário (padrão REST)
router.delete('/:id', 
  roleMiddleware(['Professor', 'Admin']),
  userController.deletarUsuario
);

// Reativar usuário
router.put('/:id/reativar', 
  roleMiddleware(['Admin', 'Professor']),
  userController.reativarUsuario
);

// Atualizar usuário
router.put('/:id', 
  validate('updateUsuario'),
  handleValidation,
  userController.atualizarUsuario
);

// Criar novo usuário
router.post('/', 
  roleMiddleware(['Admin', 'Professor']),
  validate('registrarUsuario'),
  handleValidation,
  userController.criarUsuario
);

// Atualizar senha do usuário
router.put('/:id/senha', 
  validate('updateSenha'),
  handleValidation,
  userController.atualizarSenha
);

module.exports = router;
