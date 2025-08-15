const Agendamento = require('../models/agendamentoModel');
const Processo = require('../models/processoModel');
const Usuario = require('../models/usuarioModel');
const emailService = require('../services/emailService');
const { validationResult } = require('express-validator');

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
        
        // Criar o agendamento
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
            criado_por: req.user.id
        });
        
        // Buscar o agendamento criado com relacionamentos
        const agendamentoCriado = await Agendamento.findByPk(agendamento.id, {
            include: [
                { model: Processo, as: 'processo', attributes: ['id', 'numero_processo', 'titulo'] },
                { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] }
            ]
        });

        // Enviar convites para os convidados
        if (convidados && Array.isArray(convidados) && convidados.length > 0) {
            for (const convidado of convidados) {
                if (convidado.email) {
                    try {
                        await emailService.enviarConviteAgendamento(
                            agendamentoCriado, 
                            convidado.email, 
                            convidado.nome
                        );
                        
                        // Adicionar convidado ao agendamento
                        await agendamentoCriado.adicionarConvidado(convidado.email, convidado.nome);
                        await agendamentoCriado.save();
                    } catch (emailError) {
                        console.error(`Erro ao enviar convite para ${convidado.email}:`, emailError);
                    }
                }
            }
        }
        
        res.status(201).json({ 
            success: true, 
            message: 'Agendamento criado com sucesso', 
            data: agendamentoCriado 
        });
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
};

exports.listar = async function(req, res) {
    try {
        console.log('🔍 Debug listar agendamentos:', {
            usuario_logado: req.user.id,
            email_usuario: req.user.email,
            role_id: req.user.role_id
        });
        
        const { processo_id, data_inicio, data_fim, status, tipo, page = 1, limit = 20 } = req.query;
        const where = {};
        const offset = (page - 1) * limit;
        
        // Filtrar apenas agendamentos do usuário logado (criados por ele ou onde foi convidado)
        const { Op } = require('sequelize');
        where[Op.or] = [
            { criado_por: req.user.id },
            { '$usuario.email$': req.user.email }
        ];

        if (processo_id) where.processo_id = processo_id;
        if (status) where.status = status;
        if (tipo) where.tipo = tipo;
        
        if (data_inicio && data_fim) {
            where.data_inicio = {
                [Op.between]: [data_inicio, data_fim]
            };
        }
        
        console.log('🔍 Where clause:', JSON.stringify(where, null, 2));
        
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
        
        console.log('🔍 Agendamentos encontrados na consulta:', rows.length);
        if (rows.length > 0) {
            console.log('🔍 Primeiro agendamento:', {
                id: rows[0].id,
                titulo: rows[0].titulo,
                criado_por: rows[0].criado_por
            });
        }
        
        // Filtrar também por convidados no JSON
        const agendamentosFiltrados = rows.filter(agendamento => {
            if (agendamento.criado_por === req.user.id) return true;
            
            const convidados = agendamento.convidados || [];
            return convidados.some(c => c.email === req.user.email && c.status === 'aceito');
        });
        
        console.log('🔍 Agendamentos após filtro:', agendamentosFiltrados.length);
        
        res.json({ 
            success: true, 
            data: agendamentosFiltrados, 
            pagination: { 
                total: agendamentosFiltrados.length, 
                page: parseInt(page), 
                limit: parseInt(limit), 
                totalPages: Math.ceil(agendamentosFiltrados.length / limit) 
            } 
        });
    } catch (error) {
        console.error('Erro ao listar agendamentos:', error);
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

        // Verificar se o usuário tem acesso ao agendamento
        const temAcesso = agendamento.criado_por === req.user.id || 
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
        console.log('🔍 Verificando acesso:', {
            agendamento_criado_por: agendamento.criado_por,
            usuario_atual: req.user.id,
            usuario_role: req.user.role_id,
            usuario_email: req.user.email
        });
        
        const temAcesso = agendamento.criado_por === req.user.id || 
                         (agendamento.convidados && agendamento.convidados.some(c => 
                            c.email === req.user.email && c.status === 'aceito'
                         )) ||
                         req.user.role_id === 1; // Admin pode enviar lembrete
                         
        console.log('🔍 Tem acesso:', temAcesso);

        if (!temAcesso) {
            return res.status(403).json({ success: false, message: 'Sem permissão para enviar lembrete deste agendamento' });
        }
        
        await emailService.enviarLembreteAgendamento(agendamento);
        await agendamento.marcarLembreteEnviado();
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
        
        // Se não foi passado email, usar o email do usuário logado
        const emailConvidado = email || req.user.email;
        
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
        const convidado = convidados.find(c => c.email === emailConvidado);
        
        if (!convidado) {
            return res.status(404).json({ success: false, message: 'Convite não encontrado para este email' });
        }

        if (convidado.status === 'aceito') {
            return res.status(400).json({ success: false, message: 'Convite já foi aceito anteriormente' });
        }
        
        await agendamento.aceitarConvite(emailConvidado);
        
        res.json({ 
            success: true, 
            message: 'Convite aceito com sucesso! Agendamento adicionado à sua agenda.',
            data: agendamento 
        });
    } catch (error) {
        console.error('Erro ao aceitar convite:', error);
        res.status(500).json({ success: false, message: 'Erro ao aceitar convite', error: error.message });
    }
};

exports.recusarConvite = async function(req, res) {
    try {
        const { id } = req.params;
        const { email } = req.body;
        
        // Se não foi passado email, usar o email do usuário logado
        const emailConvidado = email || req.user.email;
        
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
        const convidado = convidados.find(c => c.email === emailConvidado);
        
        if (!convidado) {
            return res.status(404).json({ success: false, message: 'Convite não encontrado para este email' });
        }

        if (convidado.status === 'recusado') {
            return res.status(400).json({ success: false, message: 'Convite já foi recusado anteriormente' });
        }
        
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
