// Controller de Processos simplificado

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
      processos: [
        {
          id: 1,
          numero_processo: '2024-001-TESTE',
          parte_contraria: 'João Silva',
          comarca: 'Cuiabá',
          vara: '1ª Vara Civil',
          valor_causa: 10000.00,
          tipo_acao: 'Civil',
          assunto: 'Cobrança',
          status: 'Em Andamento',
          prioridade: 'Normal',
          descricao: 'Processo de teste do sistema',
          idusuario_responsavel: 1,
          data_criacao: new Date().toISOString()
        },
        {
          id: 2,
          numero_processo: '2024-002-TESTE',
          parte_contraria: 'Maria Santos',
          comarca: 'Várzea Grande',
          vara: '2ª Vara Civil',
          valor_causa: 5000.00,
          tipo_acao: 'Trabalhista',
          assunto: 'Rescisão',
          status: 'Aguardando',
          prioridade: 'Alta',
          descricao: 'Processo trabalhista de teste',
          idusuario_responsavel: 2,
          data_criacao: new Date().toISOString()
        }
      ]
    };
  }
};

// Listar processos
exports.listarProcessos = async (req, res) => {
  try {
    let processos = [];
    
    if (isDbAvailable()) {
      const { processoModel: Processo, usuarioModel: Usuario } = require('../models/indexModel');
      processos = await Processo.findAll({
        include: [{ model: Usuario, as: 'responsavel' }],
        order: [['data_criacao', 'DESC']]
      });
    } else {
      const mockData = getMockData();
      processos = mockData.processos;
    }
    
    res.json(processos);
    
  } catch (error) {
    console.error('Erro ao listar processos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Obter processo por ID
exports.obterProcesso = async (req, res) => {
  try {
    const { id } = req.params;
    let processo = null;
    
    if (isDbAvailable()) {
      const { processoModel: Processo, usuarioModel: Usuario } = require('../models/indexModel');
      processo = await Processo.findByPk(id, {
        include: [{ model: Usuario, as: 'responsavel' }]
      });
    } else {
      const mockData = getMockData();
      processo = mockData.processos.find(p => p.id == id);
    }
    
    if (!processo) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }
    
    res.json(processo);
    
  } catch (error) {
    console.error('Erro ao obter processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Criar processo
exports.criarProcesso = async (req, res) => {
  try {
    const {
      numero_processo,
      parte_contraria,
      comarca,
      vara,
      valor_causa,
      tipo_acao,
      assunto,
      status = 'Em Andamento',
      prioridade = 'Normal',
      descricao,
      idusuario_responsavel
    } = req.body;
    
    if (!numero_processo || !parte_contraria || !assunto) {
      return res.status(400).json({ 
        erro: 'Número do processo, parte contrária e assunto são obrigatórios' 
      });
    }
    
    if (isDbAvailable()) {
      const { processoModel: Processo } = require('../models/indexModel');
      
      // Verificar se número do processo já existe
      const processoExistente = await Processo.findOne({ where: { numero_processo } });
      if (processoExistente) {
        return res.status(400).json({ erro: 'Número do processo já cadastrado' });
      }
      
      const novoProcesso = await Processo.create({
        numero_processo,
        parte_contraria,
        comarca,
        vara,
        valor_causa,
        tipo_acao,
        assunto,
        status,
        prioridade,
        descricao,
        idusuario_responsavel
      });
      
      res.status(201).json(novoProcesso);
      
    } else {
      // Modo mock
      const novoProcesso = {
        id: Date.now(),
        numero_processo,
        parte_contraria,
        comarca,
        vara,
        valor_causa,
        tipo_acao,
        assunto,
        status,
        prioridade,
        descricao,
        idusuario_responsavel,
        data_criacao: new Date().toISOString()
      };
      
      res.status(201).json(novoProcesso);
    }
    
  } catch (error) {
    console.error('Erro ao criar processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualizar processo
exports.atualizarProcesso = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao = req.body;
    
    if (isDbAvailable()) {
      const { processoModel: Processo } = require('../models/indexModel');
      
      const processo = await Processo.findByPk(id);
      if (!processo) {
        return res.status(404).json({ erro: 'Processo não encontrado' });
      }
      
      await processo.update(dadosAtualizacao);
      res.json(processo);
      
    } else {
      // Modo mock
      res.json({
        id: parseInt(id),
        ...dadosAtualizacao,
        atualizado_em: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Erro ao atualizar processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Deletar processo
exports.deletarProcesso = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isDbAvailable()) {
      const { processoModel: Processo } = require('../models/indexModel');
      
      const processo = await Processo.findByPk(id);
      if (!processo) {
        return res.status(404).json({ erro: 'Processo não encontrado' });
      }
      
      await processo.destroy();
      res.json({ message: 'Processo deletado com sucesso' });
      
    } else {
      // Modo mock
      res.json({ message: 'Processo deletado com sucesso (modo desenvolvimento)' });
    }
    
  } catch (error) {
    console.error('Erro ao deletar processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar processos do usuário
exports.listarProcessosUsuario = async (req, res) => {
  try {
    const userId = req.user.id;
    let processos = [];
    
    if (isDbAvailable()) {
      const { processoModel: Processo, usuarioModel: Usuario } = require('../models/indexModel');
      processos = await Processo.findAll({
        where: { idusuario_responsavel: userId },
        include: [{ model: Usuario, as: 'responsavel' }],
        order: [['data_criacao', 'DESC']]
      });
    } else {
      const mockData = getMockData();
      processos = mockData.processos.filter(p => p.idusuario_responsavel === userId);
    }
    
    res.json(processos);
    
  } catch (error) {
    console.error('Erro ao listar processos do usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
