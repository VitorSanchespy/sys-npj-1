const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware.js');
const { validate, handleValidation } = require('../middleware/validationMiddleware');
// Importando os controladores de processo
const {
    criarProcesso, vincularUsuario, atualizarProcessos,
    listarProcessos, buscarProcessoPorId, excluirProcesso,
    detalharProcessos, removerUsuarioProcessos, 
    listarUsuariosPorProcessos, listarMeusProcessos,
    buscarProcessos, listarProcessosRecentes, estatisticasProcessos
} = require('../controllers/processoControllers.js');

// Aplicar middleware de autenticação a todas as rotas
router.use(verificarToken);
router.use(interceptor403);

// TESTE DIRETO SEM ROLE MIDDLEWARE
router.get('/teste-direto', (req, res) => {
    console.log('🎯 TESTE DIRETO EXECUTADO!');
    console.log('👤 req.usuario:', req.usuario);
    res.json({ 
        message: 'Teste direto funcionou!', 
        usuario: req.usuario 
    });
});

// criar novo processo
router.post('/novo',
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
)

// Detalhar processo completo
router.get('/:processo_id/detalhes',
    roleMiddleware(['Professor', 'Admin', 'Aluno']),
    detalharProcessos
);

// listar processos
router.get('/', 
    debugMiddleware,
    roleMiddleware(['Professor', 'Admin', 'Aluno']),
    async (req, res) => {
        try {
            const { id: userId, role } = req.usuario;
            const db = require('../utils/sequelize');
            let query = `
                SELECT p.*, u.nome as usuario_responsavel
                FROM processos p
                LEFT JOIN usuarios u ON p.idusuario_responsavel = u.id
                WHERE 1=1
            `;
            // Se for Aluno, retorna apenas os processos vinculados ao aluno
            if (role === 'Aluno' || role === 2 || role === '2') {
                query += ` AND p.idusuario_responsavel = ${userId}`;
            }
            query += ` ORDER BY p.criado_em DESC`;
            const [processos] = await db.query(query);
            res.json(processos);
        } catch (error) {
            console.error('Erro ao listar processos:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }
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
router.get('/meus-processos', listarMeusProcessos);

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
router.get('/buscar', buscarProcessos);

// Vincular usuário a processo
router.post('/vincular-usuario',
    roleMiddleware(['Professor', 'Admin']),
    validate('vincularUsuario'),
    vincularUsuario
);

module.exports = router;
