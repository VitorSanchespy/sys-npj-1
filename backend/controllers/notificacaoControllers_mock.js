// Controller de Notificações com suporte a modo mock
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

// Listar notificações
exports.listarNotificacoes = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    if (!dbAvailable) {
      const notificacoesUsuario = mockData.notificacoes.filter(n => n.usuario_id === userId);
      return res.json({
        notificacoes: notificacoesUsuario,
        total: notificacoesUsuario.length,
        naoLidas: notificacoesUsuario.filter(n => !n.lida).length
      });
    } else {
      const { notificacaoModels: Notificacao } = require('../models/indexModels');
      const notificacoes = await Notificacao.findAll({
        where: { usuario_id: userId },
        order: [['data_criacao', 'DESC']]
      });
      
      const naoLidas = notificacoes.filter(n => !n.lida).length;
      
      return res.json({
        notificacoes,
        total: notificacoes.length,
        naoLidas
      });
    }
  } catch (error) {
    console.error('❌ Erro ao listar notificações:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Contar notificações não lidas
exports.contarNaoLidas = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    if (!dbAvailable) {
      const naoLidas = mockData.notificacoes.filter(n => 
        n.usuario_id === userId && !n.lida
      ).length;
      return res.json({ count: naoLidas });
    } else {
      const { notificacaoModels: Notificacao } = require('../models/indexModels');
      const count = await Notificacao.count({
        where: { 
          usuario_id: userId,
          lida: false 
        }
      });
      return res.json({ count });
    }
  } catch (error) {
    console.error('❌ Erro ao contar notificações:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Marcar como lida
exports.marcarComoLida = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    if (!dbAvailable) {
      const notificacao = mockData.notificacoes.find(n => 
        n.id === parseInt(id) && n.usuario_id === userId
      );
      
      if (!notificacao) {
        return res.status(404).json({ erro: 'Notificação não encontrada' });
      }
      
      notificacao.lida = true;
      notificacao.data_leitura = new Date();
      
      return res.json({ message: 'Notificação marcada como lida' });
    } else {
      const { notificacaoModels: Notificacao } = require('../models/indexModels');
      const notificacao = await Notificacao.findOne({
        where: { 
          id,
          usuario_id: userId 
        }
      });
      
      if (!notificacao) {
        return res.status(404).json({ erro: 'Notificação não encontrada' });
      }
      
      await notificacao.update({
        lida: true,
        data_leitura: new Date()
      });
      
      return res.json({ message: 'Notificação marcada como lida' });
    }
  } catch (error) {
    console.error('❌ Erro ao marcar como lida:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Obter configurações de notificação
exports.obterConfiguracoes = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    if (!dbAvailable) {
      const configuracoesPadrao = {
        id: 1,
        usuario_id: userId,
        email_agendamentos: true,
        email_atualizacoes: true,
        email_prazos: true,
        notificacao_desktop: true,
        data_criacao: new Date(),
        data_atualizacao: new Date()
      };
      return res.json(configuracoesPadrao);
    } else {
      const { configuracaoNotificacaoModels: ConfiguracaoNotificacao } = require('../models/indexModels');
      let configuracao = await ConfiguracaoNotificacao.findOne({
        where: { usuario_id: userId }
      });
      
      if (!configuracao) {
        configuracao = await ConfiguracaoNotificacao.create({
          usuario_id: userId,
          email_agendamentos: true,
          email_atualizacoes: true,
          email_prazos: true,
          notificacao_desktop: true
        });
      }
      
      return res.json(configuracao);
    }
  } catch (error) {
    console.error('❌ Erro ao obter configurações:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualizar configurações
exports.atualizarConfiguracoes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const novasConfiguracoes = req.body;
    
    if (!dbAvailable) {
      return res.json({ 
        message: 'Configurações atualizadas (modo desenvolvimento)',
        configuracoes: novasConfiguracoes 
      });
    } else {
      const { configuracaoNotificacaoModels: ConfiguracaoNotificacao } = require('../models/indexModels');
      let configuracao = await ConfiguracaoNotificacao.findOne({
        where: { usuario_id: userId }
      });
      
      if (!configuracao) {
        configuracao = await ConfiguracaoNotificacao.create({
          usuario_id: userId,
          ...novasConfiguracoes
        });
      } else {
        await configuracao.update(novasConfiguracoes);
      }
      
      return res.json({ 
        message: 'Configurações atualizadas com sucesso',
        configuracoes: configuracao 
      });
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar configurações:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

module.exports = exports;
