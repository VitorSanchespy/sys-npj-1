const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const processoController = require('../controllers/processesController');
const { validate } = require('../middleware/validationMiddleware');

router.use(authMiddleware);

// Rotas para processos
router.post('/', 
    validate('criarProcesso'), 
    processoController.criarProcesso
);

router.get('/', processoController.listarProcessos);

// Rotas para atribuição de alunos
router.post('/atribuir-aluno', 
    validate('atribuirAluno'),
    processoController.atribuirAluno
);

router.delete('/remover-aluno', 
    validate('atribuirAluno'), // Reutiliza a mesma validação de atribuirAluno
    processoController.removerAluno
);
// Rotas para atualizações
router.post('/:processo_id/atualizacoes',
    validate('adicionarAtualizacao'),
    processoController.adicionarAtualizacao
);

router.get('/:processo_id/alunos', 
    authMiddleware,
    processoController.listarAlunosPorProcesso
);

router.get('/meus-processos', processoController.listarMeusProcessos);

router.get('/:processo_id/atualizacoes', 
    processoController.listarAtualizacoes
);

module.exports = router;