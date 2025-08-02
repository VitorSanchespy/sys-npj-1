// Controller de Notificações simplificado

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
      notificacoes: [
        {
          id: 1,
          titulo: 'Novo Processo Atribuído',
          mensagem: 'Você foi atribuído ao processo 2024-001-TESTE',
          tipo: 'info',
          lida: false,
          idusuario: 1,
          idprocesso: 1,
          data_criacao: new Date().toISOString()
        },
        {
          id: 2,
          titulo: 'Agendamento Próximo',
          mensagem: 'Você tem uma reunião agendada para amanhã às 14:00',
          tipo: 'warning',
          lida: false,
          idusuario: 1,
          idagendamento: 1,
          data_criacao: new Date().toISOString()
        }
      ]
    };
  }
};

// Listar notificações
exports.listarNotificacoes = async (req, res) => {
  try {
    let notificacoes = [];
    
    if (isDbAvailable()) {
      const { notificacoesModels: Notificacao, usuariosModels: Usuario } = require('../models/indexModels');
      notificacoes = await Notificacao.findAll({
        include: [{ model: Usuario, as: 'usuario' }],
        order: [['data_criacao', 'DESC']]
      });
    } else {
      const mockData = getMockData();
      notificacoes = mockData.notificacoes;
    }
    
    res.json(notificacoes);
    
  } catch (error) {
    console.error('Erro ao listar notificações:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar notificações do usuário
exports.listarNotificacoesUsuario = async (req, res) => {
  try {
    const userId = req.user.id;
    let notificacoes = [];
    
    if (isDbAvailable()) {
      const { notificacoesModels: Notificacao } = require('../models/indexModels');
      notificacoes = await Notificacao.findAll({
        where: { idusuario: userId },
        order: [['data_criacao', 'DESC']]
      });
    } else {
      const mockData = getMockData();
      notificacoes = mockData.notificacoes.filter(n => n.idusuario === userId);
    }
    
    res.json(notificacoes);
    
  } catch (error) {
    console.error('Erro ao listar notificações do usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Obter notificação por ID
exports.obterNotificacao = async (req, res) => {
  try {
    const { id } = req.params;
    let notificacao = null;
    
    if (isDbAvailable()) {
      const { notificacoesModels: Notificacao, usuariosModels: Usuario } = require('../models/indexModels');
      notificacao = await Notificacao.findByPk(id, {
        include: [{ model: Usuario, as: 'usuario' }]
      });
    } else {
      const mockData = getMockData();
      notificacao = mockData.notificacoes.find(n => n.id == id);
    }
    
    if (!notificacao) {
      return res.status(404).json({ erro: 'Notificação não encontrada' });
    }
    
    res.json(notificacao);
    
  } catch (error) {
    console.error('Erro ao obter notificação:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Criar notificação
exports.criarNotificacao = async (req, res) => {
  try {
    const {
      titulo,
      mensagem,
      tipo = 'info',
      idusuario,
      idprocesso,
      idagendamento
    } = req.body;
    
    if (!titulo || !mensagem || !idusuario) {
      return res.status(400).json({ 
        erro: 'Título, mensagem e ID do usuário são obrigatórios' 
      });
    }
    
    if (isDbAvailable()) {
      const { notificacoesModels: Notificacao } = require('../models/indexModels');
      
      const novaNotificacao = await Notificacao.create({
        titulo,
        mensagem,
        tipo,
        lida: false,
        idusuario,
        idprocesso,
        idagendamento
      });
      
      res.status(201).json(novaNotificacao);
      
    } else {
      // Modo mock
      const novaNotificacao = {
        id: Date.now(),
        titulo,
        mensagem,
        tipo,
        lida: false,
        idusuario,
        idprocesso,
        idagendamento,
        data_criacao: new Date().toISOString()
      };
      
      res.status(201).json(novaNotificacao);
    }
    
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Marcar notificação como lida
exports.marcarComoLida = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isDbAvailable()) {
      const { notificacoesModels: Notificacao } = require('../models/indexModels');
      
      const notificacao = await Notificacao.findByPk(id);
      if (!notificacao) {
        return res.status(404).json({ erro: 'Notificação não encontrada' });
      }
      
      await notificacao.update({ lida: true });
      res.json(notificacao);
      
    } else {
      // Modo mock
      res.json({
        id: parseInt(id),
        lida: true,
        atualizado_em: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Marcar todas as notificações do usuário como lidas
exports.marcarTodasComoLidas = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (isDbAvailable()) {
      const { notificacoesModels: Notificacao } = require('../models/indexModels');
      
      await Notificacao.update(
        { lida: true },
        { where: { idusuario: userId, lida: false } }
      );
      
      res.json({ message: 'Todas as notificações foram marcadas como lidas' });
      
    } else {
      // Modo mock
      res.json({ message: 'Todas as notificações foram marcadas como lidas (modo desenvolvimento)' });
    }
    
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Deletar notificação
exports.deletarNotificacao = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isDbAvailable()) {
      const { notificacoesModels: Notificacao } = require('../models/indexModels');
      
      const notificacao = await Notificacao.findByPk(id);
      if (!notificacao) {
        return res.status(404).json({ erro: 'Notificação não encontrada' });
      }
      
      await notificacao.destroy();
      res.json({ message: 'Notificação deletada com sucesso' });
      
    } else {
      // Modo mock
      res.json({ message: 'Notificação deletada com sucesso (modo desenvolvimento)' });
    }
    
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Contar notificações não lidas do usuário
exports.contarNaoLidas = async (req, res) => {
  try {
    const userId = req.user.id;
    let count = 0;
    
    if (isDbAvailable()) {
      const { notificacoesModels: Notificacao } = require('../models/indexModels');
      count = await Notificacao.count({
        where: { idusuario: userId, lida: false }
      });
    } else {
      const mockData = getMockData();
      count = mockData.notificacoes.filter(n => n.idusuario === userId && !n.lida).length;
    }
    
    res.json({ count });
    
  } catch (error) {
    console.error('Erro ao contar notificações não lidas:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
