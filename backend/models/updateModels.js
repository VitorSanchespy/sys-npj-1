const db = require('../config/db');

class Atualizacao {
    static async criar({ usuario_id, processo_id, descricao, tipo = null, anexo = null }) {
        const [id] = await db('atualizacoes').insert({
            usuario_id,
            processo_id,
            descricao,
            tipo,
            anexo
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

    static async remover({ processo_id, atualizacao_id }) {
        return db('atualizacoes')
            .where({ id: atualizacao_id, processo_id })
            .del();
    }
}

module.exports = Atualizacao;