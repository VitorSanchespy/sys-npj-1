const express = require('express');
const router = express.Router();

const verificarToken = require('../middleware/authMiddleware');
const processoController = require('../controllers/processoController');
const { preveniDuplicacaoProcesso, preveniDuplicacaoVinculacao } = require('../middleware/antiDuplicacaoMiddleware');
const { validate, handleValidation } = require('../middleware/validationMiddleware');

// Autenticação obrigatória para todas rotas
router.use(verificarToken);

// Rotas básicas - com validação e anti-duplicação
router.get('/', validate('buscarProcessos'), handleValidation, processoController.listarProcessos);
router.post('/', validate('criarProcesso'), handleValidation, preveniDuplicacaoProcesso, processoController.criarProcesso);
router.get('/usuario', processoController.listarProcessosUsuario);
router.get('/:id/detalhes', validate('getProcesso'), handleValidation, processoController.obterProcessoDetalhes);
router.get('/:id/usuarios', validate('getProcesso'), handleValidation, processoController.listarUsuariosProcesso);
router.post('/:id/vincular-usuario', validate('atribuirUsuario'), handleValidation, preveniDuplicacaoVinculacao, processoController.vincularUsuario);
router.delete('/:id/desvincular-usuario', validate('getProcesso'), handleValidation, processoController.desvincularUsuario);
router.put('/:id/concluir', validate('getProcesso'), handleValidation, processoController.concluirProcesso);
router.put('/:id/reabrir', validate('getProcesso'), handleValidation, processoController.reabrirProcesso);
router.get('/:id', validate('getProcesso'), handleValidation, processoController.obterProcesso);
router.put('/:id', validate('atualizarProcesso'), handleValidation, preveniDuplicacaoProcesso, processoController.atualizarProcesso);
router.delete('/:id', validate('getProcesso'), handleValidation, processoController.deletarProcesso);

module.exports = router;
