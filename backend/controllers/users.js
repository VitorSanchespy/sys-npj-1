const db = require('../config/db');
// TODOS OS USUARIOS
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

// UPDATE USERS
exports.updateUser = (req, res) => {
  const id = req.params.id;
  const dadosAtualizados = req.body;

  db.query(
    'UPDATE usuarios SET nome=?, email=?, role_id=? WHERE id=?',
    [dadosAtualizados.nome, dadosAtualizados.email, dadosAtualizados.role_id, id],
    (erro, resultado) => {
      if (erro) return res.status(500).json({ erro });
      res.json({ mensagem: 'Perfil atualizado com sucesso' });
    }
  );
};