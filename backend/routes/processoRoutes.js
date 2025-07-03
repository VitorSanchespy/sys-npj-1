const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const processoController = require('../controllers/processesController');

router.use(authMiddleware);

// Rotas para processos
router.post('/', processoController.criarProcesso);
router.get('/', processoController.listarProcessos);

// Rotas para atribuição de alunos
router.post('/atribuir-aluno', processoController.atribuirAluno);

// Rotas para atualizações
router.post('/:processo_id/atualizacoes', processoController.adicionarAtualizacao);
router.get('/:processo_id/atualizacoes', processoController.listarAtualizacoes);

module.exports = router;