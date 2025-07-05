const Processo = require('../models/processesModels');
const Atualizacao = require('../models/updateModels');

class ProcessoController {
    async criarProcesso(req, res) {
        try {
            const { numero_processo, descricao } = req.body;
            
            if (!numero_processo || !descricao) {
                return res.status(400).json({ erro: 'Número do processo e descrição são obrigatórios' });
            
            }
            const id = await Processo.criar({ numero_processo, descricao });
            const processo = await Processo.buscarPorId(id);
            
            res.status(201).json(processo);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    async atribuirAluno(req, res) {
        try {
            const { processo_id, aluno_id } = req.body;
            
                // Validação dos campos
            if (!processo_id || !aluno_id) {
                return res.status(400).json({ erro: 'processo_id e aluno_id são obrigatórios' });
            }
            // Verificar se o usuário é um professor
            if (req.usuario.role !== 'Professor') {
                return res.status(403).json({ erro: 'Apenas professores podem atribuir alunos' });
            }
            
           await Processo.atribuirAluno(processo_id, aluno_id);
            
            res.json({ mensagem: 'Aluno atribuído com sucesso' });
        } catch (error) {
            console.error('Erro ao atribuir aluno:', error);
            res.status(500).json({ erro: error.message });
        }
    }

    async listarProcessos(req, res) {
        try {
            let processos;
            
            if (req.usuario.role === 'Aluno') {
                processos = await Processo.listarPorAluno(req.usuario.id);
            } else {
                processos = await Processo.listarTodos();
            }
            
            res.json(processos);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    async adicionarAtualizacao(req, res) {
        try {
            const { processo_id } = req.params;
            const { descricao } = req.body;
            
            if (!descricao) {
                return res.status(400).json({ erro: 'Descrição é obrigatória' });
            }

            const atualizacaoId = await Atualizacao.criar({
                usuario_id: req.usuario.id,
                processo_id,
                descricao
            });
            
            res.status(201).json({ id: atualizacaoId });
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    async listarAtualizacoes(req, res) {
        try {
            const { processo_id } = req.params;
            
            const atualizacoes = await Atualizacao.listarPorProcesso(processo_id);
            
            res.json(atualizacoes);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    async listarMeusProcessos(req, res) {
        try {
            if (req.usuario.role !== 'Aluno') {
            return res.status(403).json({ erro: 'Acesso permitido apenas para alunos' });
            }
            const processos = await Processo.listarPorAluno(req.usuario.id);
            res.json(processos);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }
    async removerAluno(req, res) {
        try {
            const { processo_id, aluno_id } = req.body;
            if (!processo_id || !aluno_id) {
                return res.status(400).json({ erro: 'processo_id e aluno_id são obrigatórios' });
            }

            // Verificar se o usuário é um professor/admin
            if (req.usuario.role !== 'Professor' && req.usuario.role !== 'Admin') {
                return res.status(403).json({ erro: 'Apenas professores ou admins podem remover alunos' });
            }

            await Processo.removerAluno(processo_id, aluno_id);
            res.json({ mensagem: 'Aluno removido do processo com sucesso' });
        } catch (error) {
            console.error('Erro ao remover aluno:', error);
            res.status(500).json({ 
                erro: error.message === 'Aluno não está atribuído a este processo' 
                    ? error.message 
                    : 'Erro interno do servidor' 
            });
        }
    }    
    async listarAlunosPorProcesso(req, res) {
    try {
        const { processo_id } = req.params; // Recebe o ID do processo pela URL

        // Validação básica
        if (!processo_id || isNaN(Number(processo_id))) {
            return res.status(400).json({ erro: 'ID do processo inválido' });
        }

        // Apenas Admin, Professor ou Aluno dono do processo pode acessar
        if (
            req.usuario.role !== 'Admin' && 
            req.usuario.role !== 'Professor' &&
            !(req.usuario.role === 'Aluno' && await Processo.verificarAlunoNoProcesso(processo_id, req.usuario.id))
        ) {
            return res.status(403).json({ erro: 'Acesso não autorizado' });
        }

        const alunos = await Processo.listarAlunosPorProcesso(processo_id);

        if (alunos.length === 0) {
            return res.status(404).json({ mensagem: 'Nenhum aluno vinculado a este processo' });
        }

        res.json(alunos);
    } catch (error) {
        console.error('Erro ao listar alunos do processo:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
    }
}

module.exports = new ProcessoController();