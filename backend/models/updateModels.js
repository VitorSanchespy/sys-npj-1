const db = require('../config/db');

class Atualizacao {
    static async criar({ usuario_id, processo_id, descricao }) {
        const [result] = await db.promise().query(
            'INSERT INTO atualizacoes (usuario_id, processo_id, descricao) VALUES (?, ?, ?)',
            [usuario_id, processo_id, descricao]
        );
        return result.insertId;
    }

    static async listarPorProcesso(processoId) {
        const [rows] = await db.promise().query(
            `SELECT a.*, u.nome as usuario_nome 
             FROM atualizacoes a
             JOIN usuarios u ON a.usuario_id = u.id
             WHERE a.processo_id = ?
             ORDER BY a.data_atualizacao DESC`,
            [processoId]
        );
        return rows;
    }
}

module.exports = Atualizacao;