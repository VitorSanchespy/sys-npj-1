const db = require('../config/db');

class Arquivo {
  static async criar({ nome, caminho, tamanho, tipo, processo_id, usuario_id }) {
    const [id] = await db('arquivos').insert({
      nome,
      caminho,
      tamanho,
      tipo,
      processo_id,
      usuario_id
    });
    return id;
  }

  static async listarPorProcesso(processoId) {
    return db('arquivos').where('processo_id', processoId);
  }
}

module.exports = Arquivo;