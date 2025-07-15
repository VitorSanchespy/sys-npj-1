const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const auxTablesController = require('../controllers/auxTablesController');

router.use(authMiddleware);

// Matéria/Assunto
router.get('/materia-assunto', auxTablesController.listar('materia_assunto'));
router.post('/materia-assunto', auxTablesController.adicionar('materia_assunto'));
router.get('/materia-assunto/buscar', auxTablesController.buscarPorNome('materia_assunto'));

// Fase
router.get('/fase', auxTablesController.listar('fase'));
router.post('/fase', auxTablesController.adicionar('fase'));
router.get('/fase/buscar', auxTablesController.buscarPorNome('fase'));

// Diligência
router.get('/diligencia', auxTablesController.listar('diligencia'));
router.post('/diligencia', auxTablesController.adicionar('diligencia'));
router.get('/diligencia/buscar', auxTablesController.buscarPorNome('diligencia'));

module.exports = router;
