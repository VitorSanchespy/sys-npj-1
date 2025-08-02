const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const { 
  listarMaterias, 
  listarFases, 
  listarDiligencias,
  listarLocais,
  criarMateria,
  criarFase,
  criarDiligencia,
  criarLocal
} = require('../controllers/tabelaAuxiliarControllers');

// Ensure express.json() middleware is applied
router.use(express.json());

// Rota de teste básica para verificar middleware  
router.get('/test', verificarToken, (req, res) => {
  res.json({ message: 'Tabela auxiliar routes working' });
});

// Rotas GET das tabelas auxiliares
router.get('/materia-assunto', verificarToken, listarMaterias);
router.get('/fase', verificarToken, listarFases);
router.get('/diligencia', verificarToken, listarDiligencias);
router.get('/local-tramitacao', verificarToken, listarLocais);

// Rotas POST das tabelas auxiliares
router.post('/materia-assunto', 
  verificarToken,
  roleMiddleware(['Professor', 'Admin']),
  async (req, res) => {
    try {
      console.log('Recebendo requisição POST para materia-assunto:', req.body);
      const { nome } = req.body;
      if (!nome) {
        return res.status(400).json({ message: 'Nome é obrigatório' });
      }
      const novaMateria = await criarMateria({ nome });
      res.status(201).json(novaMateria);
    } catch (error) {
      console.error('Erro ao criar matéria:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

router.post('/fase', 
  verificarToken,
  roleMiddleware(['Professor', 'Admin']),
  async (req, res) => {
    try {
      console.log('Recebendo requisição POST para fase:', req.body);
      const { nome } = req.body;
      if (!nome) {
        return res.status(400).json({ message: 'Nome é obrigatório' });
      }
      const novaFase = await criarFase({ nome });
    res.status(201).json(novaFase);
  } catch (error) {
    console.error('Erro ao criar fase:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

router.post('/diligencia', 
  verificarToken,
  roleMiddleware(['Professor', 'Admin']),
  async (req, res) => {
    try {
      console.log('Recebendo requisição POST para diligencia:', req.body);
      const { nome } = req.body;
      if (!nome) {
        return res.status(400).json({ message: 'Nome é obrigatório' });
      }
      const novaDiligencia = await criarDiligencia({ nome });
      res.status(201).json(novaDiligencia);
    } catch (error) {
      console.error('Erro ao criar diligência:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

router.post('/local-tramitacao', 
  verificarToken,
  roleMiddleware(['Professor', 'Admin']),
  async (req, res) => {
    try {
      console.log('Recebendo requisição POST para local-tramitacao:', req.body);
      const { nome } = req.body;
      if (!nome) {
        return res.status(400).json({ message: 'Nome é obrigatório' });
      }
      const novoLocal = await criarLocal({ nome });
      res.status(201).json(novoLocal);
    } catch (error) {
      console.error('Erro ao criar local de tramitação:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

module.exports = router;
