const {
  processoModels: Processo,
  usuariosModels: Usuario,
  atualizacoesProcessoModels: AtualizacoesProcesso,
  usuariosProcessoModels: UsuariosProcesso,
  arquivoModels: Arquivo,
  materiaAssuntoModels: MateriaAssunto,
  faseModels: Fase,
  diligenciaModels: Diligencia,
  localTramitacaoModels: LocalTramitacao
} = require('../models/indexModels');
const NotificacaoService = require('../services/notificacaoService');
const { sendNotification } = require('../services/notificationService');
const { Op } = require('sequelize');

class ProcessoController {
    async removerAtualizacao(req, res) {
        try {
            const { processo_id, atualizacao_id } = req.params;
            if (req.usuario.role !== 'Professor' && req.usuario.role !== 'Admin') {
                return res.status(403).json({ erro: 'Apenas professores ou administradores podem remover atualizações' });
            }
            const count = await AtualizacoesProcesso.destroy({ where: { id: atualizacao_id, processo_id } });
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
            if (!numero_processo || !status || !materia_assunto_id || !local_tramitacao_id || !sistema || !fase_id || !diligencia_id || !idusuario_responsavel || !contato_assistido) {
                return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios' });
            }
            const processo = await Processo.create({
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
            await sendNotification(
                'admin@example.com',
                'Novo Processo Criado',
                `Um novo processo foi criado: ${processo.id}`
            );
            res.status(201).json(processo);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    async atribuirUsuario(req, res) {
        try {
            const { processo_id, usuario_id } = req.body;
            if (!processo_id || !usuario_id) {
                return res.status(400).json({ erro: 'processo_id e usuario_id são obrigatórios' });
            }
            if (req.usuario.role !== 'Professor') {
                return res.status(403).json({ erro: 'Apenas professores podem atribuir alunos' });
            }
            // Cria vínculo na tabela de associação
            await UsuariosProcesso.create({ processo_id, usuario_id });
            res.json({ mensagem: 'Usuário atribuído com sucesso' });
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
            let where = {};
            const role = (req.usuario.role || '').toLowerCase();
            if (role === 'aluno') {
                // Busca processos em que o aluno está vinculado
                const vinculos = await UsuariosProcesso.findAll({ where: { usuario_id: req.usuario.id } });
                const ids = vinculos.map(v => v.processo_id);
                where = { id: ids };
            }
            const processos = await Processo.findAll({
                where,
                include: [
                    { model: AtualizacoesProcesso, as: 'atualizacoes' },
                    { model: Arquivo, as: 'arquivos' },
                    { model: UsuariosProcesso, as: 'usuariosProcesso' },
                    { model: MateriaAssunto, as: 'materiaAssunto' },
                    { model: Fase, as: 'fase' },
                    { model: Diligencia, as: 'diligencia' },
                    { model: LocalTramitacao, as: 'localTramitacao' }
                ]
            });
            res.json(processos);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    async buscarProcessos(req, res) {
        try {
            const filtros = { ...req.query };
            const pagina = parseInt(filtros.pagina) || 1;
            const porPagina = parseInt(filtros.porPagina) || 10;
            delete filtros.pagina;
            delete filtros.porPagina;
            // Monta where dinâmico
            const where = {};
            if (filtros.numero_processo) where.numero_processo = { [Op.like]: `%${filtros.numero_processo}%` };
            if (filtros.status) where.status = filtros.status;
            if (filtros.aluno_id) {
                const vinculos = await UsuariosProcesso.findAll({ where: { usuario_id: filtros.aluno_id } });
                const ids = vinculos.map(v => v.processo_id);
                where.id = ids;
            }
            const { count, rows } = await Processo.findAndCountAll({
                where,
                include: [
                    { model: AtualizacoesProcesso, as: 'atualizacoes' },
                    { model: Arquivo, as: 'arquivos' },
                    { model: UsuariosProcesso, as: 'usuariosProcesso' },
                    { model: MateriaAssunto, as: 'materiaAssunto' },
                    { model: Fase, as: 'fase' },
                    { model: Diligencia, as: 'diligencia' },
                    { model: LocalTramitacao, as: 'localTramitacao' }
                ],
                limit: porPagina,
                offset: (pagina - 1) * porPagina
            });
            res.json({ total: count, processos: rows });
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }


    async listarMeusProcessos(req, res) {
        try {
            if (req.usuario.role !== 'Aluno') {
                return res.status(403).json({ erro: 'Acesso permitido apenas para alunos' });
            }
            const vinculos = await UsuariosProcesso.findAll({ where: { usuario_id: req.usuario.id } });
            const ids = vinculos.map(v => v.processo_id);
            const processos = await Processo.findAll({
                where: { id: ids },
                include: [
                    { model: AtualizacoesProcesso, as: 'atualizacoes' },
                    { model: Arquivo, as: 'arquivos' },
                    { model: UsuariosProcesso, as: 'usuariosProcesso' },
                    { model: MateriaAssunto, as: 'materiaAssunto' },
                    { model: Fase, as: 'fase' },
                    { model: Diligencia, as: 'diligencia' },
                    { model: LocalTramitacao, as: 'localTramitacao' }
                ]
            });
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
            if (!["Professor", "Admin"].includes(req.usuario.role)) {
                return res.status(403).json({ erro: 'Apenas professores ou admins podem remover alunos' });
            }
            const count = await UsuariosProcesso.destroy({ where: { processo_id, usuario_id: aluno_id } });
            if (count === 0) {
                return res.status(400).json({ erro: 'Aluno não está atribuído a este processo' });
            }
            return res.json({ mensagem: 'Aluno removido do processo com sucesso' });
        } catch (error) {
            console.error('Erro ao remover aluno:', error);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    async listarAlunosPorProcesso(req, res) {
        try {
            const { processo_id } = req.params;
            if (!processo_id || isNaN(Number(processo_id))) {
                return res.status(400).json({ erro: 'ID do processo inválido' });
            }
            // Apenas Admin, Professor ou aluno vinculado
            const isAlunoDono = req.usuario.role === 'Aluno' && (await UsuariosProcesso.findOne({ where: { processo_id, usuario_id: req.usuario.id } }));
            if (!["Admin", "Professor"].includes(req.usuario.role) && !isAlunoDono) {
                return res.status(403).json({ erro: 'Acesso não autorizado' });
            }
            const vinculos = await UsuariosProcesso.findAll({ where: { processo_id }, include: [{ model: Usuario, as: 'usuario' }] });
            const usuariosComRole = vinculos.map(v => ({
                nome: v.usuario?.nome,
                role: v.usuario?.role_id === 3 ? 'Professor(a)' : 'Aluno(a)'
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
            const processo = await Processo.findByPk(processo_id, {
                include: [
                    { model: AtualizacoesProcesso, as: 'atualizacoes' },
                    { model: Arquivo, as: 'arquivos' },
                    { model: UsuariosProcesso, as: 'usuariosProcesso' },
                    { model: MateriaAssunto, as: 'materiaAssunto' },
                    { model: Fase, as: 'fase' },
                    { model: Diligencia, as: 'diligencia' },
                    { model: LocalTramitacao, as: 'localTramitacao' }
                ]
            });
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
            const vinculos = await UsuariosProcesso.findAll({
                where: { processo_id },
                include: [{ model: Usuario, as: 'usuario' }],
                limit: Number(porPagina),
                offset: (Number(pagina) - 1) * Number(porPagina)
            });
            const usuariosComRole = vinculos.map(v => ({
                nome: v.usuario?.nome,
                role: v.usuario?.role_id === 3 ? 'Professor(a)' : 'Aluno(a)'
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
            await UsuariosProcesso.create({ processo_id, usuario_id });
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
                attributes: ['id', 'nome', 'role_id']
            });
            const usuariosComRole = usuarios.map(usuario => ({
                id: usuario.id,
                nome: usuario.nome,
                role: usuario.role_id === 3 ? 'Professor(a)' : 'Aluno(a)'
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
            await UsuariosProcesso.create({ processo_id, usuario_id });
            return res.json({ mensagem: 'Usuário adicionado ao processo com sucesso' });
        } catch (error) {
            console.error('Erro ao adicionar usuário ao processo:', error);
            return res.status(500).json({ erro: error.message });
        }
    }
}

module.exports = ProcessoController;

