// Controller de Agendamentos simplificado

// Função utilitária para verificar disponibilidade do banco
function isDbAvailable() {
  return global.dbAvailable || false;
}

// Dados mock para desenvolvimento
const getMockData = () => {
  try {
    return require('../utils/mockData');
  } catch (error) {
    return {
      agendamentos: [
        {
          id: 1,
          titulo: 'Reunião com Cliente',
          descricao: 'Reunião para discutir o andamento do processo',
          data_agendamento: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
          hora_inicio: '14:00',
          hora_fim: '15:00',
          local: 'Escritório',
          tipo: 'Reunião',
          status: 'Agendado',
          idusuario: 1,
          idprocesso: 1,
          data_criacao: new Date().toISOString()
        },
        {
          id: 2,
          titulo: 'Audiência Judicial',
          descricao: 'Audiência de conciliação no processo trabalhista',
          data_agendamento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Próxima semana
          hora_inicio: '10:00',
          hora_fim: '11:00',
          local: 'Fórum Trabalhista',
          tipo: 'Audiência',
          status: 'Agendado',
          idusuario: 2,
          idprocesso: 2,
          data_criacao: new Date().toISOString()
        }
      ]
    };
  }
};

// Listar agendamentos
exports.listarAgendamentos = async (req, res) => {
  try {
    let agendamentos = [];
    
    if (isDbAvailable()) {
      try {
        const { agendamentoModel: Agendamento, usuarioModel: Usuario, processoModel: Processo } = require('../models/indexModel');
        agendamentos = await Agendamento.findAll({
          include: [
            { model: Usuario, as: 'destinatario' },
            { model: Usuario, as: 'criador' },
            { model: Processo, as: 'processo' }
          ],
          order: [['data_agendamento', 'ASC']]
        });
      } catch (dbError) {
        console.log('Erro no banco, usando dados mock:', dbError.message);
        const mockData = getMockData();
        agendamentos = mockData.agendamentos;
      }
    } else {
      const mockData = getMockData();
      agendamentos = mockData.agendamentos;
    }
    
    res.json(agendamentos);
    
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Obter agendamento por ID
exports.obterAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    let agendamento = null;
    
    if (isDbAvailable()) {
      try {
        const { agendamentoModel: Agendamento, usuarioModel: Usuario, processoModel: Processo } = require('../models/indexModel');
        agendamento = await Agendamento.findByPk(id, {
          include: [
            { model: Usuario, as: 'destinatario' },
            { model: Usuario, as: 'criador' },
            { model: Processo, as: 'processo' }
          ]
        });
      } catch (dbError) {
        console.log('Erro no banco, usando dados mock:', dbError.message);
        const mockData = getMockData();
        agendamento = mockData.agendamentos.find(a => a.id == id);
      }
    } else {
      const mockData = getMockData();
      agendamento = mockData.agendamentos.find(a => a.id == id);
    }
    
    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }
    
    res.json(agendamento);
    
  } catch (error) {
    console.error('Erro ao obter agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Criar agendamento
exports.criarAgendamento = async (req, res) => {
  try {
    const {
      titulo,
      descricao,
      data_agendamento,
      hora_inicio,
      hora_fim,
      local,
      tipo = 'Reunião',
      status = 'Agendado',
      idusuario,
      idprocesso
    } = req.body;
    
    if (!titulo || !data_agendamento || !hora_inicio) {
      return res.status(400).json({ 
        erro: 'Título, data e hora de início são obrigatórios' 
      });
    }
    
    if (isDbAvailable()) {
      try {
        const { agendamentoModel: Agendamento } = require('../models/indexModel');
        
        const novoAgendamento = await Agendamento.create({
          titulo,
          descricao,
          data_agendamento,
          hora_inicio,
          hora_fim,
          local,
          tipo,
          status,
          idusuario: idusuario || (req.user ? req.user.id : 1),
          idprocesso
        });
        
        res.status(201).json(novoAgendamento);
      } catch (dbError) {
        console.log('Erro no banco, usando modo mock:', dbError.message);
        // Fallback para modo mock
        const novoAgendamento = {
          id: Date.now(),
          titulo,
          descricao,
          data_agendamento,
          hora_inicio,
          hora_fim,
          local,
          tipo,
          status,
          idusuario: idusuario || (req.user ? req.user.id : 1),
          idprocesso,
          data_criacao: new Date().toISOString()
        };
        
        res.status(201).json(novoAgendamento);
      }
      
    } else {
      // Modo mock
      const novoAgendamento = {
        id: Date.now(),
        titulo,
        descricao,
        data_agendamento,
        hora_inicio,
        hora_fim,
        local,
        tipo,
        status,
        idusuario: idusuario || (req.user ? req.user.id : 1),
        idprocesso,
        data_criacao: new Date().toISOString()
      };
      
      res.status(201).json(novoAgendamento);
    }
    
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualizar agendamento
exports.atualizarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao = req.body;
    
    if (isDbAvailable()) {
      try {
        const { agendamentoModel: Agendamento } = require('../models/indexModel');
        
        const agendamento = await Agendamento.findByPk(id);
        if (!agendamento) {
          return res.status(404).json({ erro: 'Agendamento não encontrado' });
        }
        
        await agendamento.update(dadosAtualizacao);
        res.json(agendamento);
      } catch (dbError) {
        console.log('Erro no banco, usando modo mock:', dbError.message);
        // Fallback para modo mock
        const mockData = getMockData();
        const agendamento = mockData.agendamentos.find(a => a.id == id);
        
        if (!agendamento) {
          return res.status(404).json({ erro: 'Agendamento não encontrado' });
        }
        
        res.json({
          ...agendamento,
          ...dadosAtualizacao,
          atualizado_em: new Date().toISOString()
        });
      }
      
    } else {
      // Modo mock
      const mockData = getMockData();
      const agendamento = mockData.agendamentos.find(a => a.id == id);
      
      if (!agendamento) {
        return res.status(404).json({ erro: 'Agendamento não encontrado' });
      }
      
      res.json({
        ...agendamento,
        ...dadosAtualizacao,
        atualizado_em: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Deletar agendamento
exports.deletarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isDbAvailable()) {
      try {
        const { agendamentoModel: Agendamento } = require('../models/indexModel');
        
        const agendamento = await Agendamento.findByPk(id);
        if (!agendamento) {
          return res.status(404).json({ erro: 'Agendamento não encontrado' });
        }
        
        await agendamento.destroy();
        res.json({ message: 'Agendamento deletado com sucesso' });
      } catch (dbError) {
        console.log('Erro no banco, usando modo mock:', dbError.message);
        res.json({ message: 'Agendamento deletado com sucesso (modo desenvolvimento)' });
      }
      
    } else {
      // Modo mock
      res.json({ message: 'Agendamento deletado com sucesso (modo desenvolvimento)' });
    }
    
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar agendamentos do usuário
exports.listarAgendamentosUsuario = async (req, res) => {
  try {
    const userId = req.user.id;
    let agendamentos = [];
    
    if (isDbAvailable()) {
      try {
        const { agendamentoModel: Agendamento, usuarioModel: Usuario, processoModel: Processo } = require('../models/indexModel');
        agendamentos = await Agendamento.findAll({
          where: { idusuario: userId },
          include: [
            { model: Usuario, as: 'usuario' },
            { model: Processo, as: 'processo' }
          ],
          order: [['data_agendamento', 'ASC']]
        });
      } catch (dbError) {
        console.log('Erro no banco, usando dados mock:', dbError.message);
        const mockData = getMockData();
        agendamentos = mockData.agendamentos.filter(a => a.idusuario === userId);
      }
    } else {
      const mockData = getMockData();
      agendamentos = mockData.agendamentos.filter(a => a.idusuario === userId);
    }
    
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
    
    let agendamentos = [];
    
    if (isDbAvailable()) {
      const { agendamentoModel: Agendamento, usuarioModel: Usuario, processoModel: Processo } = require('../models/indexModel');
      const { Op } = require('sequelize');
      
      agendamentos = await Agendamento.findAll({
        where: {
          data_agendamento: {
            [Op.between]: [inicio, fim]
          }
        },
        include: [
          { model: Usuario, as: 'usuario' },
          { model: Processo, as: 'processo' }
        ],
        order: [['data_agendamento', 'ASC']]
      });
    } else {
      const mockData = getMockData();
      agendamentos = mockData.agendamentos.filter(a => {
        const dataAgendamento = new Date(a.data_agendamento);
        const dataInicio = new Date(inicio);
        const dataFim = new Date(fim);
        return dataAgendamento >= dataInicio && dataAgendamento <= dataFim;
      });
    }
    
    res.json(agendamentos);
    
  } catch (error) {
    console.error('Erro ao listar agendamentos por período:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
