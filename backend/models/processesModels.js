const db = require('../config/db');

class Processo {
    static async criar({ numero_processo, descricao }) {
        const [result] = await db.query(
            'INSERT INTO processos (numero_processo, descricao) VALUES (?, ?)',
            [numero_processo, descricao]
        );
        return result.insertId;
    }

    static async atribuirAluno(processoId, usuarioId) {
        try {
            await db.query(
                'INSERT INTO alunos_processos (usuario_id, processo_id) VALUES (?, ?)',
                [usuarioId, processoId]
            );
                return true;
            } catch (error) {
                if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                throw new Error('Processo ou aluno não encontrado');
            }
                throw error;
            }
    }

    static async buscarPorId(id) {
        const [rows] = await db.query(
            `SELECT p.*, 
             (SELECT COUNT(*) FROM alunos_processos WHERE processo_id = p.id) as total_alunos
             FROM processos p WHERE id = ?`,
            [id]
        );
        return rows[0];
    }

    static async listarPorAluno(alunoId) {
        const [rows] = await db.query(
            `SELECT p.*, ap.data_atribuicao 
             FROM processos p
             JOIN alunos_processos ap ON p.id = ap.processo_id
             WHERE ap.usuario_id = ?`,
            [alunoId]
        );
        return rows;
    }

    static async listarTodos() {
        const [rows] = await db.query(
            `SELECT p.*, 
             (SELECT COUNT(*) FROM alunos_processos WHERE processo_id = p.id) as total_alunos,
             (SELECT MAX(data_atualizacao) FROM atualizacoes WHERE processo_id = p.id) as ultima_atualizacao
             FROM processos p`
        );
        return rows;
    }
}

module.exports = Processo;