
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const processoController = require('../controllers/processesController');
const { validate } = require('../middleware/validationMiddleware');

module.exports = (processoController) => {
    router.use(authMiddleware);

    router.post('/', 
        validate('criarProcesso'), 
        processoController.criarProcesso
    );

    router.get('/', processoController.listarProcessos);

    router.post('/atribuir-aluno', 
        validate('atribuirAluno'),
        processoController.atribuirAluno
    );

    router.delete('/remover-aluno', 
        validate('atribuirAluno'),
        processoController.removerAluno
    );

    router.post('/:processo_id/atualizacoes',
        validate('adicionarAtualizacao'),
        processoController.adicionarAtualizacao
    );

    router.delete('/:processo_id/atualizacoes/:atualizacao_id',
        processoController.removerAtualizacao
    );

    router.get('/:processo_id/alunos', 
        authMiddleware,
        processoController.listarAlunosPorProcesso
    );

    router.get('/meus-processos', processoController.listarMeusProcessos);

    router.get('/:processo_id/atualizacoes', 
        processoController.listarAtualizacoes
    );

    router.get('/buscar', 
        authMiddleware,
        processoController.buscarProcessos
    );

    router.get('/:processo_id',
        authMiddleware,
        processoController.buscarProcessoPorId
    );

    return router;
}