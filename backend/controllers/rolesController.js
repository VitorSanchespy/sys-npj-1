const db = require('../config/db');

exports.listarRoles = (req, res) => {
  db.query('SELECT * FROM roles', (error, results) => {
    if (error) {
      console.error('Erro ao listar roles:', error);
      return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
    console.log(results);
    res.json(results);
  });
};

exports.criarRole = (req, res) => {
  const { nome } = req.body;
  
  if (!nome) {
    return res.status(400).json({ erro: 'O campo "nome" é obrigatório' });
  }

  db.query(
    'INSERT INTO roles (nome) VALUES ($1) RETURNING *', 
    [nome],
    (error, results) => {
      if (error) {
        console.error('Erro ao criar role:', error);
        return res.status(500).json({ erro: 'Erro interno do servidor' });
      }
      res.status(201).json(results[0]);
    }
  );
};