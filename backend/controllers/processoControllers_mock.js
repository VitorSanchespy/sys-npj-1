// Controller de Processos com suporte a modo mock
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

// Listar processos
exports.listarProcessos = async (req, res) => {
  try {
    if (!dbAvailable) {
      return res.json(mockData.processos);
    } else {
      const { processoModels: Processo } = require('../models/indexModels');
      const processos = await Processo.findAll();
      return res.json(processos);
    }
  } catch (error) {
    console.error('❌ Erro ao listar processos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Obter processo por ID
exports.obterProcesso = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!dbAvailable) {
      const processo = mockData.processos.find(p => p.id === parseInt(id));
      if (!processo) {
        return res.status(404).json({ erro: 'Processo não encontrado' });
      }
      return res.json(processo);
    } else {
      const { processoModels: Processo } = require('../models/indexModels');
      const processo = await Processo.findByPk(id);
      if (!processo) {
        return res.status(404).json({ erro: 'Processo não encontrado' });
      }
      return res.json(processo);
    }
  } catch (error) {
    console.error('❌ Erro ao obter processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Obter detalhes do processo
exports.obterDetalhesProcesso = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!dbAvailable) {
      const processo = mockData.processos.find(p => p.id === parseInt(id));
      if (!processo) {
        return res.status(404).json({ erro: 'Processo não encontrado' });
      }
      return res.json({
        ...processo,
        detalhes: 'Detalhes do processo em modo desenvolvimento'
      });
    } else {
      const { processoModels: Processo } = require('../models/indexModels');
      const processo = await Processo.findByPk(id, {
        include: ['arquivos', 'atualizacoes']
      });
      if (!processo) {
        return res.status(404).json({ erro: 'Processo não encontrado' });
      }
      return res.json(processo);
    }
  } catch (error) {
    console.error('❌ Erro ao obter detalhes do processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Criar processo
exports.criarProcesso = async (req, res) => {
  try {
    const { numero_processo, descricao, assistido, contato_assistido } = req.body;
    
    if (!dbAvailable) {
      const novoProcesso = {
        id: Date.now(),
        numero_processo,
        descricao,
        assistido,
        contato_assistido,
        data_criacao: new Date(),
        data_atualizacao: new Date()
      };
      mockData.processos.push(novoProcesso);
      return res.status(201).json(novoProcesso);
    } else {
      const { processoModels: Processo } = require('../models/indexModels');
      const novoProcesso = await Processo.create({
        numero_processo,
        descricao,
        assistido,
        contato_assistido
      });
      return res.status(201).json(novoProcesso);
    }
  } catch (error) {
    console.error('❌ Erro ao criar processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualizar processo
exports.atualizarProcesso = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao = req.body;
    
    if (!dbAvailable) {
      const index = mockData.processos.findIndex(p => p.id === parseInt(id));
      if (index === -1) {
        return res.status(404).json({ erro: 'Processo não encontrado' });
      }
      
      mockData.processos[index] = {
        ...mockData.processos[index],
        ...dadosAtualizacao,
        data_atualizacao: new Date()
      };
      
      return res.json(mockData.processos[index]);
    } else {
      const { processoModels: Processo } = require('../models/indexModels');
      const processo = await Processo.findByPk(id);
      if (!processo) {
        return res.status(404).json({ erro: 'Processo não encontrado' });
      }
      
      await processo.update(dadosAtualizacao);
      return res.json(processo);
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

module.exports = exports;
