const db = require('../config/db');
exports.updateProcess = (req, res) => {
  const processo_id = req.params.id;
  const { descricao, usuario_id } = req.body;

  // 1. Verifica se o processo existe
  db.query(
    'SELECT id FROM processos WHERE id = ?',
    [processo_id],
    (erro, resultadosProcesso) => {
      if (erro) return res.status(500).json({ erro });
      if (resultadosProcesso.length === 0) {
        return res.status(404).json({ erro: 'Processo não encontrado' });
      }

      // 2. Verifica se o usuário existe
      db.query(
        'SELECT id FROM usuarios WHERE id = ?',
        [usuario_id],
        (erro, resultadosUsuario) => {
          if (erro) return res.status(500).json({ erro });
          if (resultadosUsuario.length === 0) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
          }

          // 3. Insere a atualização
          db.query(
            `INSERT INTO atualizacoes 
             (processo_id, usuario_id, descricao, data_atualizacao) 
             VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
            [processo_id, usuario_id, descricao],
            (erro, resultado) => {
              if (erro) return res.status(500).json({ erro });
              
              res.status(201).json({ 
                mensagem: 'Atualização cadastrada com sucesso',
                dados: {
                  processo_id: processo_id,
                  usuario_id: usuario_id,
                  descricao: descricao
                }
              });
            }
          );
        }
      );    
    }
  );
};