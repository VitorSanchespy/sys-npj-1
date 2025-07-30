const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');

// Rota de teste básica para verificar middleware  
router.get('/test', verificarToken, (req, res) => {
  res.json({ message: 'Tabela auxiliar routes working' });
});

module.exports = router;
