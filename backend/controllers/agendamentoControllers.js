// Controlador de Agendamentos
const { agendamentoModels: Agendamento, usuariosModels: Usuario, rolesModels: Role } = require('../models/indexModels');
const { Op } = require('sequelize');

// Lista agendamentos baseado no role do usuário
exports.listarAgendamentos = async (req, res) => {
  try {
    const usuarioLogado = req.usuario;
    let whereCondition = {};

    // Regras de visibilidade por role
    if (usuarioLogado.role === 'Aluno') {
      // Aluno vê agendamentos criados para ele ou por ele
      whereCondition = {
        [Op.or]: [
          { usuario_id: usuarioLogado.id },
          { criado_por: usuarioLogado.id }
        ]
      };
    } else {
      // Admin e Professor veem apenas os que criaram
      whereCondition = { criado_por: usuarioLogado.id };
    }

    let agendamentos;
    try {
      agendamentos = await Agendamento.findAll({
        where: whereCondition,
        include: [
          {
            model: Usuario,
            as: 'criador',
            attributes: ['id', 'nome'],
            include: [{
              model: Role,
              as: 'role',
              attributes: ['nome']
            }]
          },
          {
            model: Usuario,
            as: 'destinatario',
            attributes: ['id', 'nome'],
            include: [{
              model: Role,
              as: 'role',
              attributes: ['nome']
            }]
          }
        ],
        order: [['data_evento', 'ASC']]
      });
    } catch (includeError) {
      console.log('Aviso: Erro ao buscar com includes, buscando sem includes:', includeError.message);
      agendamentos = await Agendamento.findAll({
        where: whereCondition,
        order: [['data_evento', 'ASC']]
      });
    }
    
    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Cria novo agendamento
exports.criarAgendamento = async (req, res) => {
  try {
    const {
      processo_id,
      usuario_id, // Para quem é o agendamento
      tipo_evento,
      titulo,
      descricao,
      data_evento,
      local,
      lembrete_1_dia,
      lembrete_2_dias,
      lembrete_1_semana
    } = req.body;
    
    const usuarioLogado = req.usuario;
    
    // Log para debug
    console.log('🔍 DEBUG - Criação de agendamento:');
    console.log('👤 Usuario logado:', usuarioLogado);
    console.log('📅 Dados do agendamento:', { processo_id, usuario_id, tipo_evento, titulo });
    
    // Validação de permissões por role
    if (usuario_id && usuario_id !== usuarioLogado.id) {
      // Só Admin e Professor podem criar agendamentos para outros
      if (usuarioLogado.role === 'Aluno') {
        return res.status(403).json({ 
          erro: 'Alunos só podem criar agendamentos para si mesmos' 
        });
      }
    }
    
    // Validação para garantir que usuarioLogado.id existe
    if (!usuarioLogado || !usuarioLogado.id) {
      console.error('❌ ERRO: Usuario logado sem ID válido:', usuarioLogado);
      return res.status(401).json({ erro: 'Usuario não autenticado corretamente' });
    }
    
    const agendamentoData = {
      processo_id: processo_id || null,
      criado_por: usuarioLogado.id, // Quem criou
      usuario_id: usuario_id || usuarioLogado.id, // Para quem é
      tipo_evento,
      titulo,
      descricao,
      data_evento,
      local,
      status: 'agendado',
      lembrete_1_dia: lembrete_1_dia || false,
      lembrete_2_dias: lembrete_2_dias || false,
      lembrete_1_semana: lembrete_1_semana || false
    };
    
    console.log('📝 Dados para criar agendamento:', agendamentoData);
    
    const agendamento = await Agendamento.create(agendamentoData);
    
    // Buscar o agendamento criado com includes se possível
    let agendamentoCompleto;
    try {
      agendamentoCompleto = await Agendamento.findByPk(agendamento.id, {
        include: [
          {
            model: Usuario,
            as: 'criador',
            attributes: ['id', 'nome'],
            include: [{
              model: Role,
              as: 'role',
              attributes: ['nome']
            }]
          },
          {
            model: Usuario,
            as: 'destinatario',
            attributes: ['id', 'nome'],
            include: [{
              model: Role,
              as: 'role',
              attributes: ['nome']
            }]
          }
        ]
      });
    } catch (includeError) {
      console.log('Aviso: Erro ao buscar includes, retornando agendamento básico:', includeError.message);
      agendamentoCompleto = agendamento;
    }
    
    res.status(201).json(agendamentoCompleto);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualiza agendamento
exports.atualizarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioLogado = req.usuario;
    
    const agendamento = await Agendamento.findByPk(id);
    
    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }
    
    // Só quem criou pode atualizar
    if (agendamento.criado_por !== usuarioLogado.id) {
      return res.status(403).json({ 
        erro: 'Apenas quem criou o agendamento pode atualizá-lo' 
      });
    }
    
    await agendamento.update(req.body);
    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Exclui agendamento
exports.excluirAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioLogado = req.usuario;
    
    const agendamento = await Agendamento.findByPk(id);
    
    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }
    
    // Só quem criou pode excluir
    if (agendamento.criado_por !== usuarioLogado.id) {
      return res.status(403).json({ 
        erro: 'Apenas quem criou o agendamento pode excluí-lo' 
      });
    }
    
    await agendamento.destroy();
    res.json({ mensagem: 'Agendamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Busca agendamento por ID
exports.buscarAgendamentoPorId = async (req, res) => {
  try {
    const usuarioLogado = req.usuario;
    
    const agendamento = await Agendamento.findByPk(req.params.id, {
      include: [
        {
          model: Usuario,
          as: 'criador',
          attributes: ['id', 'nome'],
          include: [{
            model: Role,
            as: 'role',
            attributes: ['nome']
          }]
        },
        {
          model: Usuario,
          as: 'destinatario',
          attributes: ['id', 'nome'],
          include: [{
            model: Role,
            as: 'role',
            attributes: ['nome']
          }]
        }
      ]
    });
    
    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }
    
    // Verificar se o usuário tem acesso ao agendamento
    const temAcesso = (
      agendamento.criado_por === usuarioLogado.id || // Criou o agendamento
      agendamento.usuario_id === usuarioLogado.id    // É destinatário
    );
    
    if (!temAcesso) {
      return res.status(403).json({ 
        erro: 'Você não tem permissão para visualizar este agendamento' 
      });
    }
    
    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
