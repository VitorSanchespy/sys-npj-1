const express = require('express');
const router = express.Router();

const { verificarToken } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const { validarUsuarioDuplicado } = require('../middleware/antiDuplicacaoMiddleware');
const { validate, handleValidation } = require('../middleware/validationMiddleware');

// Importar todos controladores necessários
const { 
  listarUsuarios, 
  criarUsuario, 
  buscarUsuarioPorId,
  atualizarUsuario, 
  excluirUsuario, 
  obterPerfil, 
  listarUsuariosParaVinculacao,
  listarUsuariosPorRole,
  listarUsuariosDebug,
  reativarUsuarios,
  atualizarSenhaUsuarios,
  softDeleteUsuarios,
  contarUsuariosDashboard
} = require('../controllers/usuarioControllers');

// Autenticação obrigatória para todas rotas
router.use(verificarToken);

// Rotas básicas
router.get('/', roleMiddleware(['Admin', 'Professor']), listarUsuarios);
router.post(
  '/', 
  [
    roleMiddleware(['Admin', 'Professor']),
    validarUsuarioDuplicado,
    validate('registrarUsuario'),
    handleValidation
  ],
  criarUsuario
);
router.get('/me', obterPerfil);
router.get('/:id', buscarUsuarioPorId);
router.put(
  '/:id',
  [
    validarUsuarioDuplicado,
    validate('updateUsuario'),
    handleValidation
  ],
  atualizarUsuario
);
router.delete('/:id', excluirUsuario);

// Rotas administrativas e extras
router.get('/vincular', roleMiddleware(['Professor', 'Admin']), listarUsuariosParaVinculacao);

router.get('/debug/all', roleMiddleware(['Admin']), listarUsuariosDebug);

router.get('/pagina', roleMiddleware(['Admin']), listarUsuarios);

router.get('/count', roleMiddleware(['Admin']), contarUsuariosDashboard);

router.get('/alunos', roleMiddleware(['Professor', 'Admin']), (req, res) => {
  req.params.roleName = 'Aluno';
  listarUsuariosPorRole(req, res);
});

router.get('/role/:roleName', roleMiddleware(['Professor', 'Admin']), listarUsuariosPorRole);

router.put('/:id/senha', [
  validate('updateSenha'),
  handleValidation
], atualizarSenhaUsuarios);

router.delete('/:id/soft', [
  roleMiddleware(['Professor', 'Admin']),
  softDeleteUsuarios
]);

router.put('/:id/reativar', [
  roleMiddleware(['Admin', 'Professor']),
  reativarUsuarios
]);

module.exports = router;