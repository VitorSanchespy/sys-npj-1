const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');
const { 
  listarMaterias, 
  listarFases, 
  listarLocais 
} = require('../controllers/tabelaAuxiliarControllers');

// Rota de teste básica para verificar middleware  
router.get('/test', verificarToken, (req, res) => {
  res.json({ message: 'Tabela auxiliar routes working' });
});

// Rotas das tabelas auxiliares
router.get('/materias', verificarToken, listarMaterias);
router.get('/fases', verificarToken, listarFases);
router.get('/locais-tramitacao', verificarToken, listarLocais);

module.exports = router;
