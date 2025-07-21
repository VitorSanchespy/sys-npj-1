const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware.js');
const { validate, handleValidation } = require('../middleware/validationMiddleware');
// Importando os controladores de processo
const {
    criarProcessos,  vincularUsuarioProcessos, atualizarProcessos,
    listarProcessos, removerUsuarioProcessos,
    listarUsuariosPorProcessos, listarMeusProcessos,
    buscarProcessos, detalharProcessos
} = require('../controllers/processoControllers.js');

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

// criar novo processo
router.post('/novo',
    roleMiddleware(['Professor', 'Admin']),
    validate('criarProcesso'),
    criarProcessos
);

// Atualizar processo existente
router.patch('/:processo_id',
    roleMiddleware(['Professor', 'Admin']),
    validate('atualizarProcesso'),
    handleValidation,
    atualizarProcessos
)

// Detalhar processo completo
router.get('/:processo_id/detalhes',
    roleMiddleware(['Professor', 'Admin', 'Aluno']),
    detalharProcessos
);

// listar processos
router.get('/', 
    roleMiddleware(['Professor', 'Admin']),
    listarProcessos);

// Remover usuário de processo -implementar validação
router.delete('/remover-usuario',
    validate('removerUsuario'),
    removerUsuarioProcessos
);

// Listar usuários vinculados a um processo
router.get('/:processo_id/usuarios',
    listarUsuariosPorProcessos
);

// Listar meus processos (Alunos e Professores)
router.get('/meus-processos', listarMeusProcessos);

// Buscar processos por numero
router.get('/buscar', buscarProcessos);

// listar usuários vinculados a um processo
router.get('/:processo_id/usuarios',
    authMiddleware,
    listarUsuariosPorProcessos
);

// Vincular usuário a processo
router.post('/vincular-usuario',
    roleMiddleware(['Professor', 'Admin']),
    validate('vincularUsuario'),
    vincularUsuarioProcessos
);

module.exports = router;
