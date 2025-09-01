const express = require('express');
const router = express.Router();

const verificarToken = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const usuarioController = require('../controllers/usuarioController');
const { preveniDuplicacaoUsuario } = require('../middleware/antiDuplicacaoMiddleware');
const { validate, handleValidation } = require('../middleware/validationMiddleware');

// Autenticação obrigatória para todas rotas
router.use(verificarToken);

// Rotas básicas - com validação e anti-duplicação
router.get('/me', usuarioController.me);
router.get('/perfil', usuarioController.me); // Alias para compatibilidade com testes
router.put('/me', validate('updateMe'), handleValidation, usuarioController.updateMe);
router.put('/me/senha', validate('updateSenha'), handleValidation, usuarioController.changePassword);
router.delete('/me', usuarioController.deleteMe);
router.get('/', roleMiddleware(['Admin', 'Professor']), usuarioController.listarUsuarios);
router.post('/', roleMiddleware(['Admin', 'Professor']), validate('registrarUsuario'), handleValidation, preveniDuplicacaoUsuario, usuarioController.criarUsuario);
router.get('/alunos', usuarioController.listarAlunos);
router.get('/para-vinculacao', usuarioController.buscarUsuariosParaVinculacao);

// Atualizar senha do usuário
router.put('/:id/senha', usuarioController.atualizarSenha);

router.get('/:id', validate('getUsuario'), handleValidation, usuarioController.obterUsuario);
router.put('/:id', roleMiddleware(['Admin', 'Professor']), validate('updateUsuario'), handleValidation, preveniDuplicacaoUsuario, usuarioController.atualizarUsuario);
router.put('/:id/reativar', roleMiddleware(['Admin']), validate('getUsuario'), handleValidation, usuarioController.reativarUsuario);
router.delete('/:id', roleMiddleware(['Admin', 'Professor']), validate('getUsuario'), handleValidation, usuarioController.deletarUsuario);

module.exports = router;
