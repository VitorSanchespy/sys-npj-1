const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const processoController = require('../controllers/processesController');
const { validate } = require('../middleware/validationMiddleware');


module.exports = (processoController) => {
    router.use(authMiddleware);
router.use(authMiddleware);

// Rotas para processos
/**
 * @swagger
 * /api/processos:
 *   post:
 *     summary: Cria novo processo
 *     tags: [Processos]
 */
router.post('/', 
    validate('criarProcesso'), 
    processoController.criarProcesso
);

/**
 * @swagger
 * /api/processos:
 *   get:
 *     summary: Lista processos (filtrado por role)
 *     tags: [Processos]
 */
router.get('/', processoController.listarProcessos);

// Rotas para atribuição de alunos
/**
 * @swagger
 * /api/processos/atribuir-aluno:
 *   post:
 *     summary: Atribui aluno a processo
 *     tags: [Processos]
 */
router.post('/atribuir-aluno', 
    validate('atribuirAluno'),
    processoController.atribuirAluno
);

/**
 * @swagger
 * /api/processos/remover-aluno:
 *   delete:
 *     summary: Remove aluno de processo
 *     tags: [Processos]
 */
router.delete('/remover-aluno', 
    validate('atribuirAluno'), // Reutiliza a mesma validação de atribuirAluno
    processoController.removerAluno
);
// Rotas para atualizações
/**
 * @swagger
 * /api/processos/{processo_id}/atualizacoes:
 *   post:
 *     summary: Adiciona atualização ao processo
 *     tags: [Processos]
 */
router.post('/:processo_id/atualizacoes',
    validate('adicionarAtualizacao'),
    processoController.adicionarAtualizacao
);

/**
 * @swagger
 * /api/processos/{processo_id}/alunos:
 *   get:
 *     summary: Lista alunos vinculados a um processo
 *     tags: [Processos]
 */
router.get('/:processo_id/alunos', 
    authMiddleware,
    processoController.listarAlunosPorProcesso
);

/**
 * @swagger
 * /api/processos/meus-processos:
 *   get:
 *     summary: Lista processos do usuário logado (aluno)
 *     tags: [Processos]
 */
router.get('/meus-processos', processoController.listarMeusProcessos);

/**
 * @swagger
 * /api/processos/{processo_id}/atualizacoes:
 *   get:
 *     summary: Lista atualizações de um processo
 *     tags: [Processos]
 */
router.get('/:processo_id/atualizacoes', 
    processoController.listarAtualizacoes
);

return router;
}