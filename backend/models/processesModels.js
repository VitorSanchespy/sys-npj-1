const db = require('../config/db');

class Processo {
    static async criar({ numero_processo, descricao }) {
        const [id] = await db('processos').insert({
            numero_processo,
            descricao
        });
        return id;
    }

    static async atribuirAluno(processoId, usuarioId) {
        try {
            await db('alunos_processos').insert({
                usuario_id: usuarioId,
                processo_id: processoId
            });
            return true;
        } catch (error) {
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                throw new Error('Processo ou aluno não encontrado');
            }
            throw error;
        }
    }

    static async buscarPorId(id) {
        return db('processos')
            .where('id', id)
            .select(
                '*',
                db.raw('(SELECT COUNT(*) FROM alunos_processos WHERE processo_id = processos.id) as total_alunos')
            )
            .first();
    }

    static async listarPorAluno(alunoId) {
        return db('processos')
            .join('alunos_processos', 'processos.id', 'alunos_processos.processo_id')
            .where('alunos_processos.usuario_id', alunoId)
            .select('processos.*', 'alunos_processos.data_atribuicao');
    }

    static async listarTodos() {
        return db('processos')
            .select(
                '*',
                db.raw('(SELECT COUNT(*) FROM alunos_processos WHERE processo_id = processos.id) as total_alunos'),
                db.raw('(SELECT MAX(data_atualizacao) FROM atualizacoes WHERE processo_id = processos.id) as ultima_atualizacao')
            );
    }
}

module.exports = Processo;