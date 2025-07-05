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
    static async removerAluno(processoId, alunoId) {
        try {
            const result = await db('alunos_processos')
                .where({
                    processo_id: processoId,
                    usuario_id: alunoId
                })
                .del();

            if (result === 0) {
                throw new Error('Aluno não está atribuído a este processo');
            }
            return true;
        } catch (error) {
            throw error;
        }
    }
    static async listarAlunosPorProcesso(processoId) {
    return db('alunos_processos')
        .join('usuarios', 'alunos_processos.usuario_id', 'usuarios.id')
        .where('alunos_processos.processo_id', processoId)
        .select(
            'usuarios.id as aluno_id',
            'usuarios.nome as aluno_nome',
            'usuarios.email as aluno_email',
            'alunos_processos.data_atribuicao'
        )
        .orderBy('usuarios.nome', 'asc');
    }
    static async verificarAlunoNoProcesso(processoId, alunoId) {
    const resultado = await db('alunos_processos')
        .where({ processo_id: processoId, usuario_id: alunoId })
        .first();
    return !!resultado;
    }
}

module.exports = Processo;