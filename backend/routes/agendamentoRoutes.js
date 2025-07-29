// Rotas de Agendamentos
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware.js');
const { validate, handleValidation } = require('../middleware/validationMiddleware');

// Importando os controladores de agendamento
const {
    listarAgendamentos,
    criarAgendamento,
    buscarAgendamentoPorId,
    atualizarAgendamento,
    excluirAgendamento
} = require('../controllers/agendamentoControllers');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// GET /api/agendamentos - Listar agendamentos
router.get('/', 
    roleMiddleware(['Professor', 'Admin', 'Aluno']),
    listarAgendamentos
);

// POST /api/agendamentos - Criar agendamento
router.post('/', 
    roleMiddleware(['Professor', 'Admin']),
    validate('criarAgendamento'),
    criarAgendamento
);

// GET /api/agendamentos/:id - Buscar agendamento por ID
router.get('/:id', 
    roleMiddleware(['Professor', 'Admin', 'Aluno']),
    buscarAgendamentoPorId
);

// PUT /api/agendamentos/:id - Atualizar agendamento
router.put('/:id', 
    roleMiddleware(['Professor', 'Admin']),
    validate('atualizarAgendamento'),
    atualizarAgendamento
);

// DELETE /api/agendamentos/:id - Deletar agendamento
router.delete('/:id', 
    roleMiddleware(['Professor', 'Admin']),
    excluirAgendamento
);

module.exports = router;
