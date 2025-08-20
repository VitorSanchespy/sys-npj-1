const express = require('express');
const router = express.Router();
const tabelasAuxiliaresController = require('../controllers/tabelasAuxiliaresController');
const authMiddleware = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Validações comuns
const validacaoId = [
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número positivo')
];

const validacaoNome = [
  body('nome')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('descricao')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres')
];

// ==================== MATÉRIA/ASSUNTO ====================
// GET /api/tabelas-auxiliares/materias - Listar matérias
router.get('/materias', tabelasAuxiliaresController.listarMaterias);

// POST /api/tabelas-auxiliares/materias - Criar matéria (apenas Admin)
router.post('/materias', validacaoNome, tabelasAuxiliaresController.criarMateria);

// DELETE /api/tabelas-auxiliares/materias/:id - Excluir matéria (apenas Admin)
router.delete('/materias/:id', validacaoId, tabelasAuxiliaresController.excluirMateria);

// ==================== FASE ====================
// GET /api/tabelas-auxiliares/fases - Listar fases
router.get('/fases', tabelasAuxiliaresController.listarFases);

// POST /api/tabelas-auxiliares/fases - Criar fase (apenas Admin)
router.post('/fases', validacaoNome, tabelasAuxiliaresController.criarFase);

// DELETE /api/tabelas-auxiliares/fases/:id - Excluir fase (apenas Admin)
router.delete('/fases/:id', validacaoId, tabelasAuxiliaresController.excluirFase);

// ==================== DILIGÊNCIA ====================
// GET /api/tabelas-auxiliares/diligencias - Listar diligências
router.get('/diligencias', tabelasAuxiliaresController.listarDiligencias);

// POST /api/tabelas-auxiliares/diligencias - Criar diligência (apenas Admin)
router.post('/diligencias', validacaoNome, tabelasAuxiliaresController.criarDiligencia);

// DELETE /api/tabelas-auxiliares/diligencias/:id - Excluir diligência (apenas Admin)
router.delete('/diligencias/:id', validacaoId, tabelasAuxiliaresController.excluirDiligencia);

// ==================== LOCAL DE TRAMITAÇÃO ====================
// GET /api/tabelas-auxiliares/locais-tramitacao - Listar locais de tramitação
router.get('/locais-tramitacao', tabelasAuxiliaresController.listarLocaisTramitacao);

// POST /api/tabelas-auxiliares/locais-tramitacao - Criar local de tramitação (apenas Admin)
router.post('/locais-tramitacao', validacaoNome, tabelasAuxiliaresController.criarLocalTramitacao);

// DELETE /api/tabelas-auxiliares/locais-tramitacao/:id - Excluir local de tramitação (apenas Admin)
router.delete('/locais-tramitacao/:id', validacaoId, tabelasAuxiliaresController.excluirLocalTramitacao);

module.exports = router;
