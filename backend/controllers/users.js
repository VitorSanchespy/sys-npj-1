const db = require('../config/db');
exports.allUsers = (req, res) => {
  db.query('SELECT * FROM usuarios', (error, results) => {
    if (error) {
      console.error('Erro ao listar usuarios:', error);
      return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
    console.log(results);
    res.json(results);
  });
};