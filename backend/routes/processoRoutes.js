const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { validate, handleValidation } = require('../middleware/validationMiddleware');
const processoController = require('../controllers/processesController');
module.exports = (processoController) => {
    router.use(authMiddleware);

    router.post('/novo',
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

    router.get('/:processo_id/usuarios',
        authMiddleware,
        processoController.listarUsuariosPorProcesso
    );

    router.post('/vincular-usuario',
        validate('vincularUsuario'),
        processoController.vincularUsuario
    );

    router.get('/buscar-usuarios',
        authMiddleware,
        processoController.buscarUsuarios
    );

    // Nova rota para adicionar usuários ao processo
    router.post('/processos/adicionarUsuario',
        validate('adicionarUsuario'),
        handleValidation,
        processoController.adicionarUsuario
    );

    return router;
}