const express = require('express');
const router = express.Router();

const verificarToken = require('../middleware/authMiddleware');
const processoController = require('../controllers/processoControllers');

// Autenticação obrigatória para todas rotas
router.use(verificarToken);

// Rotas básicas
router.get('/', processoController.listarProcessos);
router.post('/', processoController.criarProcesso);
router.get('/:id', processoController.buscarProcessoPorId);
router.put('/:id', processoController.atualizarProcessos);
router.delete('/:id', processoController.excluirProcesso);

module.exports = router;
