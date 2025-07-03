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

// Assign student to a process
exports.assignStudentProcess = (req, res) => {
  const processoId = req.params.id;
  const { aluno_id } = req.body;
  // Primeiro verifica se o processo e o aluno existem
  db.query(
    'SELECT id FROM processos WHERE id = ?',
    [processoId],
    (erro, resultadosProcesso) => {
      if (erro) return res.status(500).json({ erro });
      if (resultadosProcesso.length === 0) {
        return res.status(404).json({ erro: 'Processo não encontrado' });
      }

      db.query(
        'SELECT id FROM usuarios WHERE id = ? AND role_id = 3',
        [aluno_id],
        (erro, resultadosAluno) => {
          if (erro) return res.status(500).json({ erro });
          if (resultadosAluno.length === 0) {
            return res.status(404).json({ 
              erro: 'Aluno não encontrado ou não é um aluno válido',
              detalhes: 'O ID deve corresponder a um usuário com role_id = 2 (Aluno)' });
          }

          // Insere na tabela de relacionamento alunos_processos
          db.query(
            `INSERT INTO alunos_processos (usuario_id, processo_id) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE usuario_id = VALUES(usuario_id)`,
            [aluno_id, processoId],
            (erro, resultado) => {
              if (erro) return res.status(500).json({ erro });
              
              res.json({ 
                mensagem: 'Aluno atribuído ao processo com sucesso',
                dados: {
                  processo_id: processoId,
                  aluno_id: aluno_id
                }
              });
            }
          );
        }
      );
    }
  );
};