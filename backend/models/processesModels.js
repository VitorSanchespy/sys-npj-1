const db = require('../config/db');

class Processo {
    static async criar({ numero_processo, descricao }) {
        const [result] = await db.promise().query(
            'INSERT INTO processos (numero_processo, descricao) VALUES (?, ?)',
            [numero_processo, descricao]
        );
        return result.insertId;
    }

    static async atribuirAluno(processoId, usuarioId) {
        await db.promise().query(
            'INSERT INTO alunos_processos (usuario_id, processo_id) VALUES (?, ?)',
            [usuarioId, processoId]
        );
        return true;
    }

    static async buscarPorId(id) {
        const [rows] = await db.promise().query(
            'SELECT * FROM processos WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async listarPorAluno(alunoId) {
        const [rows] = await db.promise().query(
            `SELECT p.*, ap.data_atribuicao 
             FROM processos p
             JOIN alunos_processos ap ON p.id = ap.processo_id
             WHERE ap.usuario_id = ?`,
            [alunoId]
        );
        return rows;
    }

    static async listarTodos() {
        const [rows] = await db.promise().query('SELECT * FROM processos');
        return rows;
    }
}

module.exports = Processo;