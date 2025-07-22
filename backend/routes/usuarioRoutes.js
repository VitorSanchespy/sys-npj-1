const express = require('express');
const router = express.Router();
const roleMiddleware = require('../middleware/roleMiddleware.js'); // Novo middleware para roles
const authMiddleware = require('../middleware/authMiddleware');
const { validate, handleValidation, } = require('../middleware/validationMiddleware'); // Middleware de validação
// Importando os controladores de usuário
const { listarUsuarios, criarUsuarios, listarUsuariosPorRole, buscarUsuariosPorId,
atualizarUsuarios, reativarUsuarios, softDeleteUsuarios, 
listarUsuariosDebug, listarUsuariosParaVinculacao, perfilUsuario,
atualizarSenhaUsuarios} = require('../controllers/usuarioControllers.js');

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

// Endpoint temporário para depuração
router.get('/debug/all', listarUsuariosDebug);


// Rotas de perfil do usuário autenticado (devem vir antes das rotas com :id)
router.get('/me', perfilUsuario);
router.put('/me', atualizarUsuarios);
router.put('/me/senha', atualizarSenhaUsuarios);
router.delete('/me', softDeleteUsuarios);

// Soft delete usuário (padrão REST)
router.delete('/:id', [
  roleMiddleware(['Professor', 'Admin']),
  softDeleteUsuarios
]);

// Reativar usuário
router.put('/:id/reativar', [
  roleMiddleware(['Admin', 'Professor']),
  reativarUsuarios
]);

//listar paginação de usuários
router.get('/pagina', roleMiddleware(['Admin']), listarUsuarios);

// Lista todos os usuários (para admin)
router.get('/', roleMiddleware(['Admin']), listarUsuarios);

// Lista apenas alunos (para professor)
router.get('/alunos', roleMiddleware(['Professor', 'Admin']), (req, res) => {
  req.params.roleName = 'Aluno';
  return listarUsuariosPorRole(req, res);
});

// lista usuários para vinculação ao processo
router.get('/vincular', roleMiddleware(['Professor', 'Admin']), listarUsuariosParaVinculacao);

// listar usuários por role
router.get('/role/:roleName', roleMiddleware(['Professor', 'Admin']), listarUsuariosPorRole);

// buscar usuário por ID
router.get(
  '/:id',
  validate('getUsuario'),
  handleValidation,
  buscarUsuariosPorId
);

// atualizar usuário
router.put(
  '/:id',
  validate('updateUsuario'),
  handleValidation,
  atualizarUsuarios
);

// criar novo usuário
router.post(
  '/',
  roleMiddleware(['Admin']),
  validate('registrarUsuario'),
  handleValidation,
  criarUsuarios
);

// atualizar senha do usuário
router.put('/:id/senha', [
  validate('updateSenha'),
  handleValidation,
  atualizarSenhaUsuarios
]);


module.exports = router;