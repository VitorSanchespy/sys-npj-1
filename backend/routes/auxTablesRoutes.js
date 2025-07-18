const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const auxTablesController = require('../controllers/auxTablesController');
const MateriaAssunto = require('../models/materiaAssuntoModels');
const Fase = require('../models/faseModels');
const Diligencia = require('../models/diligenciaModels');

router.use(authMiddleware);

// Matéria/Assunto
router.get('/materia-assunto', auxTablesController.listar('materia_assunto'));
router.post('/materia-assunto', async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) {
      return res.status(400).json({ erro: 'Nome é obrigatório.' });
    }
    const novaMateria = await MateriaAssunto.create({ nome });
    res.status(201).json(novaMateria);
  } catch (error) {
    console.error('Erro ao adicionar matéria/assunto:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});
router.get('/materia-assunto/buscar', auxTablesController.buscarPorNome('materia_assunto'));

// Fase
router.get('/fase', auxTablesController.listar('fase'));
router.post('/fase', async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) {
      return res.status(400).json({ erro: 'Nome é obrigatório.' });
    }
    const novaFase = await Fase.create({ nome });
    res.status(201).json(novaFase);
  } catch (error) {
    console.error('Erro ao adicionar fase:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});
router.get('/fase/buscar', auxTablesController.buscarPorNome('fase'));

// Diligência
router.get('/diligencia', auxTablesController.listar('diligencia'));
router.post('/diligencia', async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) {
      return res.status(400).json({ erro: 'Nome é obrigatório.' });
    }
    const novaDiligencia = await Diligencia.create({ nome });
    res.status(201).json(novaDiligencia);
  } catch (error) {
    console.error('Erro ao adicionar diligência:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});
router.get('/diligencia/buscar', auxTablesController.buscarPorNome('diligencia'));

module.exports = router;
