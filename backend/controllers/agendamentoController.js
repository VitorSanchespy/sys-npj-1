const Agendamento = require('../models/agendamentoModel');
const Processo = require('../models/processoModel');
const Usuario = require('../models/usuarioModel');
const emailService = require('../services/emailService');
const { validationResult } = require('express-validator');
const { Sequelize } = require('sequelize');

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

        // Notificar responsáveis (Admin/Professor) para aprovação
        try {
            await emailService.enviarNotificacaoAprovacaoAgendamento(agendamentoCriado);
        } catch (emailError) {
            console.error('Erro ao enviar notificação de aprovação:', emailError);
        }
        
        res.status(201).json({ 
            success: true, 
            message: 'Agendamento criado com sucesso. Aguardando aprovação.', 
            data: agendamentoCriado 
        });
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
};

exports.listar = async function(req, res) {
    try {
        const { processo_id, data_inicio, data_fim, status, tipo, page = 1, limit = 20 } = req.query;
        const where = {};
        const offset = (page - 1) * limit;
        const { Op } = require('sequelize');
        
        // Para Admin, mostrar todos os agendamentos. Para outros, apenas os criados por eles
        if (req.user.role !== 'Admin' && req.user.role !== 'Professor') {
            where.criado_por = req.user.id;
        }
        
        if (processo_id) where.processo_id = processo_id;
        if (status) where.status = status;
        if (tipo) where.tipo = tipo;
        if (data_inicio && data_fim) {
            where.data_inicio = {
                [Op.between]: [data_inicio, data_fim]
            };
        }
        
        const { count, rows } = await Agendamento.findAndCountAll({
            where,
            include: [
                { model: Processo, as: 'processo', attributes: ['id', 'numero_processo', 'titulo'] },
                { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] }
            ],
            order: [['data_inicio', 'ASC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
        res.json({ 
            success: true, 
            data: rows, 
            pagination: { 
                total: count, 
                page: parseInt(page), 
                limit: parseInt(limit), 
                totalPages: Math.ceil(count / limit) 
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

        // Enviar convites para novos convidados
        if (convidados && Array.isArray(convidados)) {
            for (const convidado of convidados) {
                const jaConvidado = convidadosAntigos.find(c => c.email === convidado.email);
                if (!jaConvidado && convidado.email) {
                    try {
                        await emailService.enviarConviteAgendamento(
                            agendamento, 
                            convidado.email, 
                            convidado.nome
                        );
                    } catch (emailError) {
                        console.error(`Erro ao enviar convite para ${convidado.email}:`, emailError);
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

        // Verificar se o usuário tem permissão para deletar (apenas criador)
        if (agendamento.criado_por !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Apenas o criador pode deletar o agendamento' });
        }
        
        await agendamento.destroy();
        res.json({ success: true, message: 'Agendamento deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar agendamento:', error);
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
        
        // Enviar lembrete para o criador se tiver email
        const usuario = await require('../models/usuarioModel').findByPk(agendamento.criado_por);
        if (usuario && usuario.email) {
            await emailService.enviarLembreteAgendamento(agendamento, usuario.email, usuario.nome);
        }
        
        // Enviar para todos os convidados (independente do status)
        if (agendamento.convidados && Array.isArray(agendamento.convidados)) {
            for (const convidado of agendamento.convidados) {
                if (convidado.email) {
                    await emailService.enviarLembreteAgendamento(agendamento, convidado.email, convidado.nome);
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
        
        // Enviar convites para os convidados
        if (agendamento.convidados && Array.isArray(agendamento.convidados) && agendamento.convidados.length > 0) {
            for (const convidado of agendamento.convidados) {
                if (convidado.email) {
                    try {
                        await emailService.enviarConviteAgendamento(agendamento, convidado.email, convidado.nome);
                    } catch (emailError) {
                        console.error(`Erro ao enviar convite para ${convidado.email}:`, emailError);
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
