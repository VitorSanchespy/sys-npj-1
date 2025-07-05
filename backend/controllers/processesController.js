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
}

module.exports = new ProcessoController();