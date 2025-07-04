const db = require('../config/db');

class Atualizacao {
    static async criar({ usuario_id, processo_id, descricao }) {
        const [id] = await db('atualizacoes').insert({
            usuario_id,
            processo_id,
            descricao
        });
        return id;
    }

    static async listarPorProcesso(processoId) {
        return db('atualizacoes')
            .join('usuarios', 'atualizacoes.usuario_id', 'usuarios.id')
            .where('atualizacoes.processo_id', processoId)
            .where('usuarios.ativo', true)
            .select('atualizacoes.*', 'usuarios.nome as usuario_nome')
            .orderBy('atualizacoes.data_atualizacao', 'desc');
    }
}

module.exports = Atualizacao;