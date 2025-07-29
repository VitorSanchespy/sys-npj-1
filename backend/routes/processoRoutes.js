// Rotas de Processos
const express = require('express');
const router = express.Router();
const processController = require('../controllers/processoControllers');
const verificarToken = require('../middleware/authMiddleware');

// Aplicar middleware de autenticação em todas as rotas
router.use(verificarToken);

// GET /api/processos - Listar processos
router.get('/', processController.listarProcessos);

// POST /api/processos - Criar processo
router.post('/', processController.criarProcesso);

// GET /api/processos/:id - Buscar processo por ID
router.get('/:id', processController.buscarProcessoPorId);

// GET /api/processos/:id/detalhes - Detalhes do processo
router.get('/:id/detalhes', processController.buscarProcessoPorId);

// PUT /api/processos/:processo_id - Atualizar processo
router.put('/:processo_id', processController.atualizarProcessos);

// POST /api/processos/vincular-usuario - Vincular usuário ao processo
router.post('/vincular-usuario', processController.vincularUsuario);

module.exports = router;
