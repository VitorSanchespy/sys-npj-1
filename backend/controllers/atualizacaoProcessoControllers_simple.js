// Controller de Atualizações de Processo simplificado

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
      atualizacoes: [
        {
          id: 1,
          titulo: 'Processo em Andamento',
          descricao: 'Processo iniciado e documentos enviados para análise',
          status_anterior: 'Aguardando',
          status_novo: 'Em Andamento',
          idprocesso: 1,
          idusuario: 1,
          data_atualizacao: new Date().toISOString()
        },
        {
          id: 2,
          titulo: 'Documentos Anexados',
          descricao: 'Novos documentos foram anexados ao processo',
          status_anterior: 'Em Andamento',
          status_novo: 'Em Andamento',
          idprocesso: 1,
          idusuario: 2,
          data_atualizacao: new Date().toISOString()
        }
      ]
    };
  }
};

// Listar atualizações
exports.listarAtualizacoes = async (req, res) => {
  try {
    const { idprocesso } = req.query;
    let atualizacoes = [];
    
    if (isDbAvailable()) {
      const { atualizacoesModels: Atualizacao, usuariosModels: Usuario, processosModels: Processo } = require('../models/indexModels');
      const where = idprocesso ? { idprocesso } : {};
      
      atualizacoes = await Atualizacao.findAll({
        where,
        include: [
          { model: Usuario, as: 'usuario' },
          { model: Processo, as: 'processo' }
        ],
        order: [['data_atualizacao', 'DESC']]
      });
    } else {
      const mockData = getMockData();
      atualizacoes = mockData.atualizacoes;
      
      if (idprocesso) {
        atualizacoes = atualizacoes.filter(a => a.idprocesso == idprocesso);
      }
    }
    
    res.json(atualizacoes);
    
  } catch (error) {
    console.error('Erro ao listar atualizações:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Obter atualização por ID
exports.obterAtualizacao = async (req, res) => {
  try {
    const { id } = req.params;
    let atualizacao = null;
    
    if (isDbAvailable()) {
      const { atualizacoesModels: Atualizacao, usuariosModels: Usuario, processosModels: Processo } = require('../models/indexModels');
      atualizacao = await Atualizacao.findByPk(id, {
        include: [
          { model: Usuario, as: 'usuario' },
          { model: Processo, as: 'processo' }
        ]
      });
    } else {
      const mockData = getMockData();
      atualizacao = mockData.atualizacoes.find(a => a.id == id);
    }
    
    if (!atualizacao) {
      return res.status(404).json({ erro: 'Atualização não encontrada' });
    }
    
    res.json(atualizacao);
    
  } catch (error) {
    console.error('Erro ao obter atualização:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Criar atualização
exports.criarAtualizacao = async (req, res) => {
  try {
    const {
      titulo,
      descricao,
      status_anterior,
      status_novo,
      idprocesso
    } = req.body;
    
    if (!titulo || !descricao || !idprocesso) {
      return res.status(400).json({ 
        erro: 'Título, descrição e ID do processo são obrigatórios' 
      });
    }
    
    if (isDbAvailable()) {
      const { atualizacoesModels: Atualizacao } = require('../models/indexModels');
      
      const novaAtualizacao = await Atualizacao.create({
        titulo,
        descricao,
        status_anterior,
        status_novo,
        idprocesso,
        idusuario: req.user.id
      });
      
      res.status(201).json(novaAtualizacao);
      
    } else {
      // Modo mock
      const novaAtualizacao = {
        id: Date.now(),
        titulo,
        descricao,
        status_anterior,
        status_novo,
        idprocesso,
        idusuario: req.user.id,
        data_atualizacao: new Date().toISOString()
      };
      
      res.status(201).json(novaAtualizacao);
    }
    
  } catch (error) {
    console.error('Erro ao criar atualização:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualizar atualização (editar)
exports.atualizarAtualizacao = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao = req.body;
    
    if (isDbAvailable()) {
      const { atualizacoesModels: Atualizacao } = require('../models/indexModels');
      
      const atualizacao = await Atualizacao.findByPk(id);
      if (!atualizacao) {
        return res.status(404).json({ erro: 'Atualização não encontrada' });
      }
      
      await atualizacao.update(dadosAtualizacao);
      res.json(atualizacao);
      
    } else {
      // Modo mock
      res.json({
        id: parseInt(id),
        ...dadosAtualizacao,
        atualizado_em: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Erro ao atualizar atualização:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Deletar atualização
exports.deletarAtualizacao = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isDbAvailable()) {
      const { atualizacoesModels: Atualizacao } = require('../models/indexModels');
      
      const atualizacao = await Atualizacao.findByPk(id);
      if (!atualizacao) {
        return res.status(404).json({ erro: 'Atualização não encontrada' });
      }
      
      await atualizacao.destroy();
      res.json({ message: 'Atualização deletada com sucesso' });
      
    } else {
      // Modo mock
      res.json({ message: 'Atualização deletada com sucesso (modo desenvolvimento)' });
    }
    
  } catch (error) {
    console.error('Erro ao deletar atualização:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
