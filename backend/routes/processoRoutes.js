// Rotas de Processos
const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const processController = require('../controllers/processoControllers');
const verificarToken = require('../utils/authMiddleware');
=======
const authMiddleware = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware.js');
const { validate, handleValidation } = require('../middleware/validationMiddleware');
>>>>>>> 631e91f783120f46177e0e5e9cc8462e2edf0526

// Importando os controladores de processo
const {
    criarProcesso, vincularUsuarioProcessos, atualizarProcessos,
    listarProcessos, removerUsuarioProcessos,
    listarUsuariosPorProcessos, listarMeusProcessos,
    buscarProcessos, detalharProcessos, excluirProcesso,
    listarProcessosRecentes, estatisticasProcessos, buscarProcessoPorId,
    vincularUsuario
} = require('../controllers/processoControllers.js');

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

// criar novo processo
router.post('/novo',
    roleMiddleware(['Professor', 'Admin']),
    validate('criarProcesso'),
    criarProcesso
);

// listar processos
router.get('/', 
    roleMiddleware(['Professor', 'Admin', 'Aluno']),
    listarProcessos
);

// POST /api/processos - Criar processo
router.post('/', 
    roleMiddleware(['Professor', 'Admin']),
    validate('criarProcesso'),
    criarProcesso
);

// Atualizar processo existente
router.patch('/:processo_id',
    roleMiddleware(['Professor', 'Admin', 'Aluno']),
    validate('atualizarProcesso'),
    handleValidation,
    atualizarProcessos
);

// PUT /api/processos/:processo_id - Atualizar processo
router.put('/:processo_id', 
    roleMiddleware(['Professor', 'Admin', 'Aluno']),
    validate('atualizarProcesso'),
    handleValidation,
    atualizarProcessos
);

// Detalhar processo completo
router.get('/:processo_id/detalhes',
    roleMiddleware(['Professor', 'Admin', 'Aluno']),
    detalharProcessos
);

// GET /api/processos/:id/detalhes - Detalhes do processo
router.get('/:id/detalhes', 
    roleMiddleware(['Professor', 'Admin', 'Aluno']),
    buscarProcessoPorId
);

// GET /api/processos/:id - Buscar processo por ID
router.get('/:id', 
    roleMiddleware(['Professor', 'Admin', 'Aluno']),
    buscarProcessoPorId
);

// Remover usuário de processo
router.delete('/remover-usuario',
    roleMiddleware(['Professor', 'Admin']),
    validate('removerUsuario'),
    removerUsuarioProcessos
);

// Listar usuários vinculados a um processo
router.get('/:processo_id/usuarios',
    roleMiddleware(['Professor', 'Admin', 'Aluno']),
    listarUsuariosPorProcessos
);

// Listar meus processos (Alunos e Professores)
router.get('/meus-processos', 
    roleMiddleware(['Professor', 'Admin', 'Aluno']),
    listarMeusProcessos
);

// Listar processos recentes (últimos 5 atualizados)
router.get('/recentes', 
    roleMiddleware(['Professor', 'Admin', 'Aluno']),
    listarProcessosRecentes
);

// Estatísticas dos processos (para dashboard)
router.get('/stats', 
    roleMiddleware(['Professor', 'Admin']),
    estatisticasProcessos
);

// Buscar processos por numero
router.get('/buscar', 
    roleMiddleware(['Professor', 'Admin', 'Aluno']),
    buscarProcessos
);

// POST /api/processos/vincular-usuario - Vincular usuário ao processo
router.post('/vincular-usuario',
    roleMiddleware(['Professor', 'Admin']),
    validate('vincularUsuario'),
    vincularUsuario
);

// Excluir processo
router.delete('/:id',
    roleMiddleware(['Professor', 'Admin']),
    excluirProcesso
);

module.exports = router;
