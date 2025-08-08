// Controller de Agendamentos
const path = require('path');

// Criar agendamento
exports.criarAgendamento = async (req, res) => {
  try {
    console.log('📅 Dados recebidos para criar agendamento:', req.body);
    console.log('👤 Usuário autenticado:', req.user);
    
    const {
      titulo,
      descricao,
      data_evento,
      tipo_evento = 'reuniao',
      status = 'agendado',
      local,
      processo_id,
      usuario_id,
      lembrete_1_dia = true,
      lembrete_2_dias = true,
      lembrete_1_semana = false
    } = req.body;
    
    console.log('📝 Dados processados:', {
      titulo,
      descricao,
      data_evento,
      tipo_evento,
      status,
      local,
      processo_id,
      usuario_id,
      usuario_req: req.user?.id
    });
    
    if (!titulo || !titulo.trim() || !data_evento) {
      console.log('❌ Validação falhou: título ou data ausente');
      return res.status(400).json({ 
        erro: 'Título e data do evento são obrigatórios' 
      });
    }
    
    // Validar tipo_evento
    const tiposValidos = ['audiencia', 'prazo', 'reuniao', 'diligencia', 'outro'];
    if (!tiposValidos.includes(tipo_evento)) {
      console.log('❌ Tipo de evento inválido:', tipo_evento);
      return res.status(400).json({ 
        erro: `Tipo de evento inválido. Valores aceitos: ${tiposValidos.join(', ')}` 
      });
    }
    
    const { agendamentoModel: Agendamento, usuarioModel: Usuario, processoModel: Processo } = require('../models/indexModel');
    
    const dadosAgendamento = {
      titulo,
      descricao,
      data_evento: new Date(data_evento),
      tipo_evento,
      status,
      local,
      processo_id: processo_id && processo_id !== '' ? processo_id : null,
      usuario_id: usuario_id || req.user.id,
      criado_por: req.user.id,
      lembrete_1_dia,
      lembrete_2_dias,
      lembrete_1_semana
    };
    
    console.log('💾 Dados para salvar no banco:', dadosAgendamento);
    
    const novoAgendamento = await Agendamento.create(dadosAgendamento);
    
    console.log('✅ Agendamento criado com sucesso, ID:', novoAgendamento.id);
    
    // Buscar o agendamento criado com as associações
    const agendamentoCriado = await Agendamento.findByPk(novoAgendamento.id, {
      include: [
        { model: Usuario, as: 'destinatario', attributes: ['id', 'nome', 'email'] },
        { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] },
        { model: Processo, as: 'processo', attributes: ['id', 'numero_processo', 'descricao'] }
      ]
    });
    
    res.status(201).json(agendamentoCriado);
    
  } catch (error) {
    console.error('❌ Erro detalhado ao criar agendamento:', error);
    console.error('❌ Stack trace:', error.stack);
    
    // Verificar se é erro de validação do Sequelize
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeDatabaseError') {
      const validationErrors = error.errors?.map(err => err.message) || [error.message];
      return res.status(400).json({ 
        erro: 'Erro de validação', 
        detalhes: validationErrors 
      });
    }
    
    res.status(500).json({ erro: 'Erro interno do servidor', detalhes: error.message });
  }
};

// Listar agendamentos
exports.listarAgendamentos = async (req, res) => {
  try {
    const { agendamentoModel: Agendamento, usuarioModel: Usuario, processoModel: Processo } = require('../models/indexModel');
    
    const where = {};
    
    // Filtros opcionais
    if (req.query.status) {
      where.status = req.query.status;
    }
    
    if (req.query.usuario_id) {
      where.usuario_id = req.query.usuario_id;
    }
    
    if (req.query.tipo_evento) {
      where.tipo_evento = req.query.tipo_evento;
    }
    
    if (req.query.data_inicio && req.query.data_fim) {
      where.data_evento = {
        [require('sequelize').Op.between]: [
          new Date(req.query.data_inicio),
          new Date(req.query.data_fim)
        ]
      };
    }
    
    const agendamentos = await Agendamento.findAll({
      where,
      include: [
        { model: Usuario, as: 'destinatario', attributes: ['id', 'nome', 'email'] },
        { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] },
        { model: Processo, as: 'processo', attributes: ['id', 'numero_processo', 'descricao'] }
      ],
      order: [['data_evento', 'ASC']]
    });
    
    res.json(agendamentos);
    
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Buscar agendamento por ID
exports.obterAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { agendamentoModel: Agendamento, usuarioModel: Usuario, processoModel: Processo } = require('../models/indexModel');
    
    const agendamento = await Agendamento.findByPk(id, {
      include: [
        { model: Usuario, as: 'destinatario', attributes: ['id', 'nome', 'email'] },
        { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] },
        { model: Processo, as: 'processo', attributes: ['id', 'numero_processo', 'descricao'] }
      ]
    });
    
    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }
    
    res.json(agendamento);
    
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualizar agendamento
exports.atualizarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao = req.body;
    
    console.log('🔄 Atualizando agendamento ID:', id);
    console.log('📝 Dados recebidos:', dadosAtualizacao);
    
    const { agendamentoModel: Agendamento, usuarioModel: Usuario, processoModel: Processo } = require('../models/indexModel');
    
    const agendamento = await Agendamento.findByPk(id);
    
    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }
    
    // Atualizar apenas os campos fornecidos
    if (dadosAtualizacao.data_evento) {
      dadosAtualizacao.data_evento = new Date(dadosAtualizacao.data_evento);
    }
    
    await agendamento.update(dadosAtualizacao);
    
    // Buscar o agendamento atualizado com as associações (com fallback)
    try {
      const agendamentoAtualizado = await Agendamento.findByPk(id, {
        include: [
          { 
            model: Usuario, 
            as: 'destinatario', 
            attributes: ['id', 'nome', 'email'],
            required: false
          },
          { 
            model: Usuario, 
            as: 'criador', 
            attributes: ['id', 'nome', 'email'],
            required: false
          },
          { 
            model: Processo, 
            as: 'processo', 
            attributes: ['id', 'numero_processo', 'descricao'],
            required: false
          }
        ]
      });
      
      res.json(agendamentoAtualizado);
    } catch (includeError) {
      console.warn('⚠️ Erro nas associações, retornando sem includes:', includeError.message);
      // Se der erro nas associações, retorna sem elas
      const agendamentoSimples = await Agendamento.findByPk(id);
      res.json(agendamentoSimples);
    }
    
  } catch (error) {
    console.error('❌ Erro ao atualizar agendamento:', error);
    console.error('❌ Stack trace:', error.stack);
    
    // Verificar se é erro de validação do Sequelize
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeDatabaseError') {
      const validationErrors = error.errors?.map(err => err.message) || [error.message];
      return res.status(400).json({ 
        erro: 'Erro de validação', 
        detalhes: validationErrors 
      });
    }
    
    res.status(500).json({ erro: 'Erro interno do servidor', detalhes: error.message });
  }
};

// Excluir agendamento
exports.deletarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { agendamentoModel: Agendamento } = require('../models/indexModel');
    
    const agendamento = await Agendamento.findByPk(id);
    
    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }
    
    await agendamento.destroy();
    
    res.json({ mensagem: 'Agendamento excluído com sucesso' });
    
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar agendamentos do usuário
exports.listarAgendamentosUsuario = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { agendamentoModel: Agendamento, usuarioModel: Usuario, processoModel: Processo } = require('../models/indexModel');
    
    const agendamentos = await Agendamento.findAll({
      where: { usuario_id: userId },
      include: [
        { model: Usuario, as: 'destinatario', attributes: ['id', 'nome', 'email'] },
        { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] },
        { model: Processo, as: 'processo', attributes: ['id', 'numero_processo', 'descricao'] }
      ],
      order: [['data_evento', 'ASC']]
    });
    
    res.json(agendamentos);
    
  } catch (error) {
    console.error('Erro ao listar agendamentos do usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar agendamentos por período
exports.listarAgendamentosPeriodo = async (req, res) => {
  try {
    const { inicio, fim } = req.query;
    
    if (!inicio || !fim) {
      return res.status(400).json({ erro: 'Período de início e fim são obrigatórios' });
    }
    
    const { agendamentoModel: Agendamento, usuarioModel: Usuario, processoModel: Processo } = require('../models/indexModel');
    const { Op } = require('sequelize');
    
    const agendamentos = await Agendamento.findAll({
      where: {
        data_evento: {
          [Op.between]: [inicio, fim]
        }
      },
      include: [
        { model: Usuario, as: 'destinatario', attributes: ['id', 'nome', 'email'] },
        { model: Usuario, as: 'criador', attributes: ['id', 'nome', 'email'] },
        { model: Processo, as: 'processo', attributes: ['id', 'numero_processo', 'descricao'] }
      ],
      order: [['data_evento', 'ASC']]
    });
    
    res.json(agendamentos);
    
  } catch (error) {
    console.error('Erro ao listar agendamentos por período:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
