const Agendamento = require('../models/agendamentoModel');
const Processo = require('../models/processoModel');
const Usuario = require('../models/usuarioModel');
const UsuarioProcesso = require('../models/usuarioProcessoModel');
const emailService = require('../services/emailService');
const { validationResult } = require('express-validator');
const { Sequelize } = require('sequelize');

/**
 * Verificar se um usuário está vinculado ao processo
 */
async function verificarUsuarioVinculadoAoProcesso(email, processoId) {
    if (!processoId || !email) return false;
    
    try {
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) return false;
        
        const vinculo = await UsuarioProcesso.findOne({
            where: {
                usuario_id: usuario.id,
                processo_id: processoId
            }
        });
        
        return !!vinculo;
    } catch (error) {
        console.error(`Erro ao verificar vínculo do usuário ${email} ao processo ${processoId}:`, error);
        return false;
    }
}

exports.criar = async function(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'Dados inválidos', errors: errors.array() });
        }
        
        const { 
            processo_id, 
            titulo, 
            descricao, 
            data_inicio, 
            data_fim, 
            local, 
            tipo, 
            email_lembrete, 
            convidados,
            observacoes 
        } = req.body;
        
        // Verificar se o processo existe (caso processo_id seja fornecido)
        if (processo_id) {
            const processo = await Processo.findByPk(processo_id);
            if (!processo) {
                return res.status(404).json({ success: false, message: 'Processo não encontrado' });
            }
        }
        
        // Criar o agendamento com status inicial "em_analise"
        const agendamento = await Agendamento.create({
            processo_id,
            titulo,
            descricao,
            data_inicio,
            data_fim,
            local,
            tipo: tipo || 'reuniao',
            email_lembrete,
            convidados: convidados || [],
            observacoes,
            criado_por: req.user.id,
            status: 'em_analise'
        });
        
        // Buscar o agendamento criado com relacionamentos
        const agendamentoCriado = await Agendamento.findByPk(agendamento.id, {
            include: [
                { model: Processo, as: 'processo', attributes: ['id', 'numero_processo', 'titulo'] },
                { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] }
            ]
        });

                res.status(201).json({ 
                        success: true, 
                        message: 'Agendamento criado com sucesso. Aguardando aprovação.', 
                        data: agendamentoCriado 
                });

                // Enviar e-mail somente após resposta de sucesso
                setImmediate(async () => {
                    try {
                        await emailService.enviarNotificacaoAprovacaoAgendamento(agendamentoCriado);
                    } catch (emailError) {
                        console.error('Erro ao enviar notificação de aprovação:', emailError);
                    }
                });
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
};

exports.listar = async function(req, res) {
    try {
        const { 
            processo_id, 
            data_inicio, 
            data_fim, 
            status = 'marcado', // Por padrão mostrar apenas marcados
            tipo, 
            local,
            search,
            incluir_cancelados = 'false',
            page = 1, 
            limit = 12 
        } = req.query;
        
        const where = {};
        const offset = (page - 1) * limit;
        const { Op } = require('sequelize');
        
        // Para Admin/Professor, mostrar todos os agendamentos. Para outros, apenas os criados por eles
        const userRole = req.user.role?.nome || req.user.role;
        if (userRole !== 'Admin' && userRole !== 'Professor') {
            where.criado_por = req.user.id;
        }
        
        // Filtros básicos
        if (processo_id) where.processo_id = processo_id;
        if (tipo) where.tipo = tipo;
        if (local) where.local = { [Op.like]: `%${local}%` };
        
        // Filtro de status com tratamento especial para cancelados
        if (incluir_cancelados === 'true') {
            // Se incluir cancelados estiver ativo, buscar apenas cancelados
            where.status = 'cancelado';
        } else if (status === 'todos') {
            // Se status for 'todos', excluir apenas cancelados
            where.status = { [Op.ne]: 'cancelado' };
        } else if (status) {
            // Status específico (exceto cancelado)
            where.status = status;
        }
        
        // Filtro de data
        if (data_inicio && data_fim) {
            where.data_inicio = {
                [Op.between]: [data_inicio, data_fim]
            };
        } else if (data_inicio) {
            where.data_inicio = {
                [Op.gte]: data_inicio
            };
        } else if (data_fim) {
            where.data_inicio = {
                [Op.lte]: data_fim
            };
        }
        
        // Busca textual
        if (search && search.trim()) {
            where[Op.or] = [
                { titulo: { [Op.like]: `%${search.trim()}%` } },
                { descricao: { [Op.like]: `%${search.trim()}%` } },
                { local: { [Op.like]: `%${search.trim()}%` } },
                { observacoes: { [Op.like]: `%${search.trim()}%` } }
            ];
        }
        
        const { count, rows } = await Agendamento.findAndCountAll({
            where,
            include: [
                { 
                    model: Processo, 
                    as: 'processo', 
                    attributes: ['id', 'numero_processo', 'titulo'],
                    required: false
                },
                { 
                    model: Usuario, 
                    as: 'usuario', 
                    attributes: ['id', 'nome', 'email'],
                    required: false
                }
            ],
            order: [['data_inicio', 'DESC']], // Mais recentes primeiro
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true
        });
        
        res.json({ 
            success: true, 
            data: rows, 
            pagination: { 
                total: count, 
                page: parseInt(page), 
                limit: parseInt(limit), 
                totalPages: Math.ceil(count / limit) 
            },
            filters: {
                status,
                tipo,
                local,
                search,
                incluir_cancelados,
                data_inicio,
                data_fim
            }
        });
    } catch (error) {
        console.error('❌ Erro ao listar agendamentos:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
};

exports.buscarPorId = async function(req, res) {
    try {
        const { id } = req.params;
        const agendamento = await Agendamento.findByPk(id, {
            include: [
                { model: Processo, as: 'processo', attributes: ['id', 'numero_processo', 'titulo'] },
                { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] }
            ]
        });
        
        if (!agendamento) {
            return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
        }

        // Admin/Professor podem acessar qualquer agendamento
        const isAdminOrProfessor = ['Admin', 'Professor'].includes(req.user.role);
        const temAcesso = isAdminOrProfessor || agendamento.criado_por === req.user.id || 
                         (agendamento.convidados && agendamento.convidados.some(c => 
                            c.email === req.user.email && c.status === 'aceito'
                         ));

        if (!temAcesso) {
            return res.status(403).json({ success: false, message: 'Sem permissão para acessar este agendamento' });
        }
        
        res.json({ success: true, data: agendamento });
    } catch (error) {
        console.error('Erro ao buscar agendamento:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
};

exports.atualizar = async function(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'Dados inválidos', errors: errors.array() });
        }

        const { id } = req.params;
        const { 
            titulo, 
            descricao, 
            data_inicio, 
            data_fim, 
            local, 
            tipo, 
            status, 
            email_lembrete, 
            convidados,
            observacoes 
        } = req.body;

        const agendamento = await Agendamento.findByPk(id, {
            include: [
                { model: Processo, as: 'processo', attributes: ['id', 'numero_processo', 'titulo'] },
                { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] }
            ]
        });
        
        if (!agendamento) {
            return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
        }

        // Verificar se o usuário tem permissão para editar (apenas criador)
        if (agendamento.criado_por !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Apenas o criador pode editar o agendamento' });
        }

        // Guardar convidados antigos para comparar
        const convidadosAntigos = agendamento.convidados || [];

        await agendamento.update({
            titulo: titulo || agendamento.titulo,
            descricao: descricao !== undefined ? descricao : agendamento.descricao,
            data_inicio: data_inicio || agendamento.data_inicio,
            data_fim: data_fim || agendamento.data_fim,
            local: local !== undefined ? local : agendamento.local,
            tipo: tipo || agendamento.tipo,
            status: status || agendamento.status,
            email_lembrete: email_lembrete !== undefined ? email_lembrete : agendamento.email_lembrete,
            convidados: convidados !== undefined ? convidados : agendamento.convidados,
            observacoes: observacoes !== undefined ? observacoes : agendamento.observacoes,
            lembrete_enviado: false
        });

        // Enviar convites para novos convidados (apenas se vinculados ao processo)
        if (convidados && Array.isArray(convidados)) {
            for (const convidado of convidados) {
                const jaConvidado = convidadosAntigos.find(c => c.email === convidado.email);
                if (!jaConvidado && convidado.email) {
                    // Verificar se o convidado está vinculado ao processo
                    const vinculado = await verificarUsuarioVinculadoAoProcesso(convidado.email, agendamento.processo_id);
                    
                    if (vinculado) {
                        try {
                            await emailService.enviarConviteAgendamento(
                                agendamento, 
                                convidado.email, 
                                convidado.nome
                            );
                            console.log(`📧 Convite enviado para ${convidado.email} (vinculado ao processo)`);
                        } catch (emailError) {
                            console.error(`Erro ao enviar convite para ${convidado.email}:`, emailError);
                        }
                    } else {
                        console.log(`⚠️ Convite NÃO enviado para ${convidado.email} - usuário não vinculado ao processo`);
                    }
                }
            }
        }

        const agendamentoAtualizado = await Agendamento.findByPk(id, {
            include: [
                { model: Processo, as: 'processo', attributes: ['id', 'numero_processo', 'titulo'] },
                { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] }
            ]
        });
        
        res.json({ success: true, message: 'Agendamento atualizado com sucesso', data: agendamentoAtualizado });
    } catch (error) {
        console.error('Erro ao atualizar agendamento:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
};

exports.deletar = async function(req, res) {
    try {
        const { id } = req.params;
        const agendamento = await Agendamento.findByPk(id);
        
        if (!agendamento) {
            return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
        }

        // Verificar permissão: Admin/Professor ou criador
        const userRole = req.user.role?.nome || req.user.role;
        const isAdminOrProfessor = ['Admin', 'Professor'].includes(userRole);
        const isCriador = agendamento.criado_por === req.user.id;
        
        if (!isAdminOrProfessor && !isCriador) {
            return res.status(403).json({ 
                success: false, 
                message: 'Apenas o criador pode deletar o agendamento' 
            });
        }
        
        await agendamento.destroy();
        res.json({ success: true, message: 'Agendamento deletado com sucesso' });
    } catch (error) {
        console.error('❌ Erro ao deletar agendamento:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
};

exports.listarPorProcesso = async function(req, res) {
    try {
        const { processoId } = req.params;
        const agendamentos = await Agendamento.findByProcesso(processoId);
        res.json({ success: true, data: agendamentos });
    } catch (error) {
        console.error('Erro ao listar agendamentos do processo:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
};

// Novo endpoint para obter opções de filtros
exports.obterFiltros = async function(req, res) {
    try {
        const { Op } = require('sequelize');
        
        // Buscar status disponíveis
        const statusDisponiveis = await Agendamento.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('status')), 'status']],
            where: {
                status: { [Op.ne]: null }
            },
            raw: true
        });
        
        // Buscar tipos disponíveis
        const tiposDisponiveis = await Agendamento.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('tipo')), 'tipo']],
            where: {
                tipo: { [Op.ne]: null }
            },
            raw: true
        });
        
        // Buscar locais únicos
        const locaisDisponiveis = await Agendamento.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('local')), 'local']],
            where: {
                local: { [Op.ne]: null }
            },
            limit: 20, // Limitar para evitar muitos resultados
            raw: true
        });
        
        res.json({
            success: true,
            data: {
                status: statusDisponiveis.map(s => s.status).filter(Boolean),
                tipos: tiposDisponiveis.map(t => t.tipo).filter(Boolean),
                locais: locaisDisponiveis.map(l => l.local).filter(Boolean)
            }
        });
    } catch (error) {
        console.error('❌ Erro ao obter filtros:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
};

exports.marcarStatus = async function(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['pendente', 'confirmado', 'concluido', 'cancelado'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Status inválido' });
        }
        
        const agendamento = await Agendamento.findByPk(id);
        if (!agendamento) {
            return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
        }
        
        await agendamento.update({ status });
        res.json({ success: true, message: `Agendamento marcado como ${status}`, data: agendamento });
    } catch (error) {
        console.error('Erro ao marcar status:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
};

exports.enviarLembrete = async function(req, res) {
    try {
        const { id } = req.params;
        const agendamento = await Agendamento.findByPk(id, {
            include: [
                { model: Processo, as: 'processo', attributes: ['id', 'numero_processo', 'titulo'] },
                { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] }
            ]
        });
        
        if (!agendamento) {
            return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
        }

        // Verificar se o usuário tem acesso ao agendamento
        // Admin/Professor podem enviar lembrete de qualquer agendamento
        // Criador pode enviar lembrete do próprio agendamento
        // Convidados aceitos podem enviar lembrete
        const isAdminOrProfessor = ['Admin', 'Professor'].includes(req.user.role);
        const isCriador = agendamento.criado_por === req.user.id;
        const isConvidadoAceito = agendamento.convidados && agendamento.convidados.some(c => 
            c.email === req.user.email && c.status === 'aceito'
        );
        
        if (!isAdminOrProfessor && !isCriador && !isConvidadoAceito) {
            return res.status(403).json({ success: false, message: 'Sem permissão para enviar lembrete deste agendamento' });
        }
        
        // Enviar lembrete para o criador se tiver email e estiver vinculado ao processo
        const usuario = await require('../models/usuarioModel').findByPk(agendamento.criado_por);
        if (usuario && usuario.email) {
            const vinculado = await verificarUsuarioVinculadoAoProcesso(usuario.email, agendamento.processo_id);
            if (vinculado) {
                await emailService.enviarLembreteAgendamento(agendamento, usuario.email, usuario.nome);
                console.log(`📧 Lembrete enviado para criador ${usuario.email} (vinculado ao processo)`);
            } else {
                console.log(`⚠️ Lembrete NÃO enviado para criador ${usuario.email} - não vinculado ao processo`);
            }
        }
        
        // Enviar para convidados vinculados ao processo
        if (agendamento.convidados && Array.isArray(agendamento.convidados)) {
            for (const convidado of agendamento.convidados) {
                if (convidado.email) {
                    const vinculado = await verificarUsuarioVinculadoAoProcesso(convidado.email, agendamento.processo_id);
                    if (vinculado) {
                        await emailService.enviarLembreteAgendamento(agendamento, convidado.email, convidado.nome);
                        console.log(`📧 Lembrete enviado para ${convidado.email} (vinculado ao processo)`);
                    } else {
                        console.log(`⚠️ Lembrete NÃO enviado para ${convidado.email} - não vinculado ao processo`);
                    }
                }
            }
        }
        
        // Marcar lembrete como enviado se o campo existir
        if (typeof agendamento.marcarLembreteEnviado === 'function') {
            await agendamento.marcarLembreteEnviado();
        } else {
            agendamento.lembrete_enviado = true;
            await agendamento.save();
        }
        res.json({ success: true, message: 'Lembrete enviado com sucesso' });
    } catch (error) {
        console.error('Erro ao enviar lembrete:', error);
        res.status(500).json({ success: false, message: 'Erro ao enviar lembrete', error: error.message });
    }
};

exports.aceitarConvite = async function(req, res) {
    try {
        const { id } = req.params;
        const { email } = req.body;
        
        const agendamento = await Agendamento.findByPk(id);
        if (!agendamento) {
            return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
        }

        const emailConvidado = email || req.user.email;
        await agendamento.aceitarConvite(emailConvidado);
        
        res.json({ 
            success: true, 
            message: 'Convite aceito com sucesso.',
            data: agendamento 
        });
    } catch (error) {
        console.error('Erro ao aceitar convite:', error);
        res.status(500).json({ success: false, message: 'Erro ao aceitar convite', error: error.message });
    }
};

exports.aceitarConvitePublico = async function(req, res) {
    try {
        const { id } = req.params;
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email é obrigatório' });
        }
        
        const agendamento = await Agendamento.findByPk(id, {
            include: [
                { model: Processo, as: 'processo', attributes: ['id', 'numero_processo', 'titulo'] },
                { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] }
            ]
        });
        
        if (!agendamento) {
            return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
        }

        // Verificar se o email está na lista de convidados
        const convidados = agendamento.convidados || [];
        const convidado = convidados.find(c => c.email === email);
        
        if (!convidado) {
            return res.status(403).json({ success: false, message: 'Email não encontrado na lista de convidados' });
        }

        await agendamento.aceitarConvite(email);
        
        res.json({ 
            success: true, 
            message: 'Convite aceito com sucesso! Obrigado por confirmar sua participação.',
            data: {
                agendamento: {
                    id: agendamento.id,
                    titulo: agendamento.titulo,
                    data_inicio: agendamento.data_inicio,
                    local: agendamento.local,
                    descricao: agendamento.descricao
                },
                status: 'aceito'
            }
        });
    } catch (error) {
        console.error('Erro ao aceitar convite público:', error);
        res.status(500).json({ success: false, message: 'Erro ao aceitar convite', error: error.message });
    }
};

exports.recusarConvite = async function(req, res) {
    try {
        const { id } = req.params;
        const { email } = req.body;
        
        const agendamento = await Agendamento.findByPk(id);
        if (!agendamento) {
            return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
        }

        const emailConvidado = email || req.user.email;
        await agendamento.recusarConvite(emailConvidado);
        
        res.json({ 
            success: true, 
            message: 'Convite recusado com sucesso.',
            data: agendamento 
        });
    } catch (error) {
        console.error('Erro ao recusar convite:', error);
        res.status(500).json({ success: false, message: 'Erro ao recusar convite', error: error.message });
    }
};

exports.recusarConvitePublico = async function(req, res) {
    try {
        const { id } = req.params;
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email é obrigatório' });
        }
        
        const agendamento = await Agendamento.findByPk(id, {
            include: [
                { model: Processo, as: 'processo', attributes: ['id', 'numero_processo', 'titulo'] },
                { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] }
            ]
        });
        
        if (!agendamento) {
            return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
        }

        // Verificar se o email está na lista de convidados
        const convidados = agendamento.convidados || [];
        const convidado = convidados.find(c => c.email === email);
        
        if (!convidado) {
            return res.status(403).json({ success: false, message: 'Email não encontrado na lista de convidados' });
        }

        await agendamento.recusarConvite(email);
        
        res.json({ 
            success: true, 
            message: 'Convite recusado. Obrigado por nos informar.',
            data: {
                agendamento: {
                    id: agendamento.id,
                    titulo: agendamento.titulo,
                    data_inicio: agendamento.data_inicio,
                    local: agendamento.local,
                    descricao: agendamento.descricao
                },
                status: 'recusado'
            }
        });
    } catch (error) {
        console.error('Erro ao recusar convite público:', error);
        res.status(500).json({ success: false, message: 'Erro ao recusar convite', error: error.message });
    }
};

exports.buscarParaLembrete = async function(req, res) {
    try {
        const agendamentos = await Agendamento.findPendentesLembrete();
        
        res.json({ 
            success: true, 
            message: `${agendamentos.length} agendamentos encontrados para lembrete`,
            data: agendamentos 
        });
    } catch (error) {
        console.error('Erro ao buscar agendamentos para lembrete:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar agendamentos para lembrete', error: error.message });
    }
};

// Aprovar agendamento (apenas Admin/Professor)
exports.aprovar = async function(req, res) {
    try {
        const { id } = req.params;
        const { observacoes } = req.body;
        
        // Verificar se usuário tem permissão (Admin ou Professor)
        if (!['Admin', 'Professor'].includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Apenas Admin ou Professor podem aprovar agendamentos' 
            });
        }
        
        const agendamento = await Agendamento.findByPk(id, {
            include: [
                { model: Processo, as: 'processo' },
                { model: Usuario, as: 'usuario' }
            ]
        });
        
        if (!agendamento) {
            return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
        }
        
        if (agendamento.status !== 'em_analise') {
            return res.status(400).json({ 
                success: false, 
                message: 'Agendamento não está em análise' 
            });
        }
        
        // Aprovar e marcar como enviando convites
        agendamento.status = 'enviando_convites';
        agendamento.aprovado_por = req.user.id;
        agendamento.data_aprovacao = new Date();
        if (observacoes) agendamento.observacoes = observacoes;
        await agendamento.save();
        
        // Enviar convites para os convidados (apenas se vinculados ao processo)
        if (agendamento.convidados && Array.isArray(agendamento.convidados) && agendamento.convidados.length > 0) {
            for (const convidado of agendamento.convidados) {
                if (convidado.email) {
                    // Verificar se o convidado está vinculado ao processo
                    const vinculado = await verificarUsuarioVinculadoAoProcesso(convidado.email, agendamento.processo_id);
                    
                    if (vinculado) {
                        try {
                            await emailService.enviarConviteAgendamento(agendamento, convidado.email, convidado.nome);
                            console.log(`📧 Convite enviado para ${convidado.email} (vinculado ao processo)`);
                        } catch (emailError) {
                            console.error(`Erro ao enviar convite para ${convidado.email}:`, emailError);
                        }
                    } else {
                        console.log(`⚠️ Convite NÃO enviado para ${convidado.email} - usuário não vinculado ao processo`);
                    }
                }
            }
        }
        
        res.json({ 
            success: true, 
            message: 'Agendamento aprovado com sucesso. Convites sendo enviados.',
            data: agendamento 
        });
    } catch (error) {
        console.error('Erro ao aprovar agendamento:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
};

// Recusar agendamento (apenas Admin/Professor)
exports.recusar = async function(req, res) {
    try {
        const { id } = req.params;
        const { motivo_recusa } = req.body;
        
        // Verificar se usuário tem permissão (Admin ou Professor)
        if (!['Admin', 'Professor'].includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Apenas Admin ou Professor podem recusar agendamentos' 
            });
        }
        
        if (!motivo_recusa || motivo_recusa.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Motivo da recusa é obrigatório' 
            });
        }
        
        const agendamento = await Agendamento.findByPk(id, {
            include: [
                { model: Processo, as: 'processo' },
                { model: Usuario, as: 'usuario' }
            ]
        });
        
        if (!agendamento) {
            return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
        }
        
        if (agendamento.status !== 'em_analise') {
            return res.status(400).json({ 
                success: false, 
                message: 'Agendamento não está em análise' 
            });
        }
        
        // Recusar agendamento
        agendamento.status = 'cancelado';
        agendamento.motivo_recusa = motivo_recusa;
        await agendamento.save();
        
        // Notificar o criador sobre a recusa
        try {
            await emailService.enviarNotificacaoRecusaAgendamento(agendamento, motivo_recusa);
        } catch (emailError) {
            console.error('Erro ao enviar notificação de recusa:', emailError);
        }
        
        res.json({ 
            success: true, 
            message: 'Agendamento recusado com sucesso.',
            data: agendamento 
        });
    } catch (error) {
        console.error('Erro ao recusar agendamento:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
};
