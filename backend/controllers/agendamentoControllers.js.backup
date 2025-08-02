// Controller de Agendamentos com suporte a modo mock
let dbAvailable = false;
let mockData = null;

try {
  const sequelize = require('../utils/sequelize');
  sequelize.authenticate().then(() => {
    dbAvailable = true;
  }).catch(() => {
    dbAvailable = false;
    mockData = require('../utils/mockData');
  });
} catch (error) {
  mockData = require('../utils/mockData');
  dbAvailable = false;
}

if (!mockData) {
  mockData = require('../utils/mockData');
}

// Listar agendamentos
exports.listarAgendamentos = async (req, res) => {
  try {
    if (!dbAvailable) {
      return res.json(mockData.agendamentos);
    } else {
      const { agendamentoModels: Agendamento } = require('../models/indexModels');
      const agendamentos = await Agendamento.findAll();
      return res.json(agendamentos);
    }
  } catch (error) {
    console.error('❌ Erro ao listar agendamentos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Obter agendamento por ID
exports.obterAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!dbAvailable) {
      const agendamento = mockData.agendamentos.find(a => a.id === parseInt(id));
      if (!agendamento) {
        return res.status(404).json({ erro: 'Agendamento não encontrado' });
      }
      return res.json(agendamento);
    } else {
      const { agendamentoModels: Agendamento } = require('../models/indexModels');
      const agendamento = await Agendamento.findByPk(id);
      if (!agendamento) {
        return res.status(404).json({ erro: 'Agendamento não encontrado' });
      }
      return res.json(agendamento);
    }
  } catch (error) {
    console.error('❌ Erro ao obter agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Criar agendamento
exports.criarAgendamento = async (req, res) => {
  try {
    const { tipo_evento, titulo, descricao, data_evento, local, processo_id } = req.body;
    const criado_por = req.user.userId;
    
    if (!dbAvailable) {
      const novoAgendamento = {
        id: Date.now(),
        tipo_evento,
        titulo,
        descricao,
        data_evento: new Date(data_evento),
        local,
        processo_id,
        criado_por,
        data_criacao: new Date(),
        data_atualizacao: new Date()
      };
      mockData.agendamentos.push(novoAgendamento);
      return res.status(201).json(novoAgendamento);
    } else {
      const { agendamentoModels: Agendamento } = require('../models/indexModels');
      const novoAgendamento = await Agendamento.create({
        tipo_evento,
        titulo,
        descricao,
        data_evento,
        local,
        processo_id,
        criado_por
      });
      return res.status(201).json(novoAgendamento);
    }
  } catch (error) {
    console.error('❌ Erro ao criar agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualizar agendamento
exports.atualizarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao = req.body;
    
    if (!dbAvailable) {
      const index = mockData.agendamentos.findIndex(a => a.id === parseInt(id));
      if (index === -1) {
        return res.status(404).json({ erro: 'Agendamento não encontrado' });
      }
      
      mockData.agendamentos[index] = {
        ...mockData.agendamentos[index],
        ...dadosAtualizacao,
        data_atualizacao: new Date()
      };
      
      return res.json(mockData.agendamentos[index]);
    } else {
      const { agendamentoModels: Agendamento } = require('../models/indexModels');
      const agendamento = await Agendamento.findByPk(id);
      if (!agendamento) {
        return res.status(404).json({ erro: 'Agendamento não encontrado' });
      }
      
      await agendamento.update(dadosAtualizacao);
      return res.json(agendamento);
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Deletar agendamento
exports.deletarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!dbAvailable) {
      const index = mockData.agendamentos.findIndex(a => a.id === parseInt(id));
      if (index === -1) {
        return res.status(404).json({ erro: 'Agendamento não encontrado' });
      }
      
      mockData.agendamentos.splice(index, 1);
      return res.json({ message: 'Agendamento deletado com sucesso' });
    } else {
      const { agendamentoModels: Agendamento } = require('../models/indexModels');
      const agendamento = await Agendamento.findByPk(id);
      if (!agendamento) {
        return res.status(404).json({ erro: 'Agendamento não encontrado' });
      }
      
      await agendamento.destroy();
      return res.json({ message: 'Agendamento deletado com sucesso' });
    }
  } catch (error) {
    console.error('❌ Erro ao deletar agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Função para configurar serviço de notificações (compatibilidade)
exports.setNotificacaoService = (service) => {
  // Em modo mock, apenas log
  console.log('📬 Serviço de notificações configurado no controller de agendamentos');
};

module.exports = exports;
