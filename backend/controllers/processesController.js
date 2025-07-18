const Processo = require('../models/processoModels');
const Atualizacao = require('../models/updateModels');
const NotificacaoService = require('../services/notificacaoService');
const { sendNotification } = require('../services/notificationService');
const Usuario = require('../models/usuarioModels');
const { Op } = require('sequelize');

class ProcessoController {
    async removerAtualizacao(req, res) {
        try {
            const { processo_id, atualizacao_id } = req.params;
            // Permitir apenas professor ou admin
            if (req.usuario.role !== 'Professor' && req.usuario.role !== 'Admin') {
                return res.status(403).json({ erro: 'Apenas professores ou administradores podem remover atualizações' });
            }
            const count = await Atualizacao.remover({ processo_id, atualizacao_id });
            if (count === 0) {
                return res.status(404).json({ erro: 'Atualização não encontrada' });
            }
            res.json({ mensagem: 'Atualização removida com sucesso' });
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }
        constructor(io) {
        this.notificacaoService = new NotificacaoService(io);
        }
    async criarProcesso(req, res) {
        try {
            const {
                numero_processo,
                descricao,
                status,
                materia_assunto_id,
                local_tramitacao_id,
                sistema,
                fase_id,
                diligencia_id,
                idusuario_responsavel,
                data_encerramento,
                observacoes,
                num_processo_sei,
                assistido,
                contato_assistido
            } = req.body;
            console.log('Dados recebidos:', req.body);
            if (!numero_processo || !status || !materia_assunto_id || !local_tramitacao_id || !sistema || !fase_id || !diligencia_id || !idusuario_responsavel || !contato_assistido) {
                console.log('Campo faltando:', {
                    numero_processo,
                    status,
                    materia_assunto_id,
                    local_tramitacao_id,
                    sistema,
                    fase_id,
                    diligencia_id,
                    idusuario_responsavel,
                    contato_assistido
                });
                return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios' });
            }
            const id = await Processo.criar({
                numero_processo,
                descricao,
                status,
                materia_assunto_id,
                local_tramitacao_id,
                sistema,
                fase_id,
                diligencia_id,
                idusuario_responsavel,
                data_encerramento,
                observacoes,
                num_processo_sei,
                assistido,
                contato_assistido
            });
            const processo = await Processo.buscarPorId(id);

            // Enviar notificação após a criação do processo
            await sendNotification(
                'admin@example.com',
                'Novo Processo Criado',
                `Um novo processo foi criado: ${id}`
            );

            res.status(201).json(processo);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    async atribuirUsuario(req, res) {
        try {
            const { processo_id, usuario_id } = req.body;
            // Validação dos campos
            if (!processo_id || !usuario_id) {
                return res.status(400).json({ erro: 'processo_id e usuario_id são obrigatórios' });
            }
            // Verificar se o usuário é um professor
            if (req.usuario.role !== 'Professor') {
                return res.status(403).json({ erro: 'Apenas professores podem atribuir alunos' });
            }
            await Processo.atribuirAluno(processo_id, ususario_id);
            res.json({ mensagem: 'Usuario atribuído com sucesso' });
        } catch (error) {
            console.error('Erro ao atribuir usuario:', error);
            if (error.status === 409) {
                return res.status(409).json({ erro: error.message });
            }
            res.status(500).json({ erro: error.message });
        }
    }

    async listarProcessos(req, res) {
        try {
            let processos;
            const role = (req.usuario.role || '').toLowerCase();
            if (role === 'aluno') {
                processos = await Processo.listarPorAluno(req.usuario.id);
            } else if (role === 'professor' || role === 'admin') {
                processos = await Processo.listarTodos();
            } else {
                processos = await Processo.listarTodos();
            }
            res.json(processos);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    async buscarProcessos(req, res) {
    try {
        // Recebe filtros da query string (?numero_processo=123&aluno_id=1)
        const filtros = req.query;
        
        // Recebe parâmetros de paginação
        const paginacao = {
            pagina: parseInt(req.query.pagina) || 1,
            porPagina: parseInt(req.query.porPagina) || 10
        };

        // Remove campos de paginação dos filtros
        delete filtros.pagina;
        delete filtros.porPagina;

        const resultado = await Processo.buscarComFiltros(filtros, paginacao);
        res.json(resultado);
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
            return res.json(processos);
        } catch (error) {
            console.error('Erro ao listar meus processos:', error);
            return res.status(500).json({ erro: 'Erro ao buscar processos do aluno.' });
        }
    }

    async removerAluno(req, res) {
        try {
            const { processo_id, aluno_id } = req.body;
            if (!processo_id || !aluno_id) {
                return res.status(400).json({ erro: 'processo_id e aluno_id são obrigatórios' });
            }
            // Verificar se o usuário é um professor/admin
            if (!["Professor", "Admin"].includes(req.usuario.role)) {
                return res.status(403).json({ erro: 'Apenas professores ou admins podem remover alunos' });
            }
            await Processo.removerAluno(processo_id, aluno_id);
            return res.json({ mensagem: 'Aluno removido do processo com sucesso' });
        } catch (error) {
            console.error('Erro ao remover aluno:', error);
            if (error.message === 'Aluno não está atribuído a este processo') {
                return res.status(400).json({ erro: error.message });
            }
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    async listarAlunosPorProcesso(req, res) {
        try {
            const { processo_id } = req.params;
            // Validação básica
            if (!processo_id || isNaN(Number(processo_id))) {
                return res.status(400).json({ erro: 'ID do processo inválido' });
            }
            // Apenas Admin, Professor ou 
            const isAlunoDono = req.usuario.role === 'Aluno' && await Processo.verificarAlunoNoProcesso(processo_id, req.usuario.id);
            if (!["Admin", "Professor"].includes(req.usuario.role) && !isAlunoDono) {
                return res.status(403).json({ erro: 'Acesso não autorizado' });
            }
            const usuarios = await Processo.listarUsuariosPorProcesso(processo_id);
            const usuariosComRole = usuarios.map(usuario => ({
                nome: usuario.nome,
                role: usuario.role === 'Professor' ? 'Professor(a)' : 'Aluno(a)'
            }));
            return res.json(usuariosComRole);
        } catch (error) {
            console.error('Erro ao listar usuários do processo:', error);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }
    
    async buscarProcessoPorId(req, res) {
        const { processo_id } = req.params;
        try {
            const processo = await Processo.buscarPorId(processo_id);
            if (!processo) return res.status(404).json({ erro: 'Processo não encontrado' });
            return res.json(processo);
        } catch (error) {
            console.error('Erro ao buscar processo por ID:', error);
            return res.status(500).json({ erro: 'Erro ao buscar processo.' });
        }
    }

    async listarUsuariosPorProcesso(req, res) {
        try {
            const { processo_id } = req.params;
            const { pagina = 1, porPagina = 10 } = req.query;

            if (!processo_id || isNaN(Number(processo_id))) {
                return res.status(400).json({ erro: 'ID do processo inválido' });
            }

            const usuarios = await Processo.listarUsuariosPorProcesso(processo_id, pagina, porPagina);
            const usuariosComRole = usuarios.map(usuario => ({
                nome: usuario.nome,
                role: usuario.role === 'Professor' ? 'Professor(a)' : 'Aluno(a)'
            }));

            return res.json(usuariosComRole);
        } catch (error) {
            console.error('Erro ao listar usuários do processo:', error);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    async vincularUsuario(req, res) {
        try {
            const { processo_id, usuario_id, role } = req.body;
            if (!processo_id || !usuario_id || !role) {
                return res.status(400).json({ erro: 'processo_id, usuario_id e role são obrigatórios' });
            }
            if (!['Aluno', 'Professor'].includes(role)) {
                return res.status(400).json({ erro: 'Role inválida' });
            }
            await Processo.vincularUsuario(processo_id, usuario_id, role);
            return res.json({ mensagem: 'Usuário vinculado com sucesso' });
        } catch (error) {
            console.error('Erro ao vincular usuário:', error);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    async buscarUsuarios(req, res) {
        try {
            const { nome } = req.query;
            if (!nome) {
                return res.status(400).json({ erro: 'O parâmetro nome é obrigatório' });
            }

            const usuarios = await Usuario.findAll({
                where: {
                    nome: {
                        [Op.like]: `%${nome}%`
                    }
                },
                attributes: ['id', 'nome', 'role']
            });

            const usuariosComRole = usuarios.map(usuario => ({
                id: usuario.id,
                nome: usuario.nome,
                role: usuario.role === 'Professor' ? 'Professor(a)' : 'Aluno(a)'
            }));

            return res.json(usuariosComRole);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    async adicionarUsuario(req, res) {
        try {
            const { processo_id, usuario_id } = req.body;

            if (!processo_id || !usuario_id) {
                return res.status(400).json({ erro: 'processo_id e usuario_id são obrigatórios' });
            }

            await Processo.adicionarUsuarioAoProcesso(processo_id, usuario_id);

            return res.json({ mensagem: 'Usuário adicionado ao processo com sucesso' });
        } catch (error) {
            console.error('Erro ao adicionar usuário ao processo:', error);
            return res.status(500).json({ erro: error.message });
        }
    }
}

module.exports = ProcessoController;

