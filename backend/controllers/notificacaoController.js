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
          tipo: 'informacao',
          status: 'pendente',
          usuario_id: 1,
          processo_id: 1,
          criado_em: new Date().toISOString()
        },
        {
          id: 2,
          titulo: 'Agendamento Próximo',
          mensagem: 'Você tem uma reunião agendada para amanhã às 14:00',
          tipo: 'alerta',
          status: 'pendente',
          usuario_id: 1,
          agendamento_id: 1,
          criado_em: new Date().toISOString()
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
      const { notificacaoModel: Notificacao, usuarioModel: Usuario } = require('../models/indexModel');
      notificacoes = await Notificacao.findAll({
        include: [{ model: Usuario, as: 'usuario' }],
        order: [['criado_em', 'DESC']]
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

// Listar notificações do usuário com estatísticas
exports.listarNotificacoesUsuario = async (req, res) => {
  try {
    const userId = req.user.id;
    let notificacoes = [];
    let total = 0;
    let naoLidas = 0;
    
    if (isDbAvailable()) {
      const { notificacaoModel: Notificacao } = require('../models/indexModel');
      notificacoes = await Notificacao.findAll({
        where: { usuario_id: userId },
        order: [['criado_em', 'DESC']]
      });
      
      total = notificacoes.length;
      naoLidas = notificacoes.filter(n => ['pendente', 'enviado'].includes(n.status)).length;
    } else {
      const mockData = getMockData();
      notificacoes = mockData.notificacoes.filter(n => n.usuario_id === userId);
      total = notificacoes.length;
      naoLidas = notificacoes.filter(n => ['pendente', 'enviado'].includes(n.status)).length;
    }
    
    res.json({
      notificacoes,
      total,
      naoLidas
    });
    
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
      const { notificacaoModel: Notificacao, usuarioModel: Usuario } = require('../models/indexModel');
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
      tipo = 'informacao',
      usuario_id,
      idusuario, // suporte para formato alternativo
      processo_id,
      agendamento_id
    } = req.body;
    
    // Aceita tanto usuario_id quanto idusuario para compatibilidade
    const userId = usuario_id || idusuario;
    
    // Normalizar o tipo para valores aceitos
    const tipoNormalizado = ['info', 'alerta', 'erro', 'sucesso', 'informacao'].includes(tipo) 
      ? (tipo === 'info' ? 'informacao' : tipo) 
      : 'informacao';
    
    if (!titulo || !mensagem || !userId) {
      return res.status(400).json({ 
        erro: 'Título, mensagem e ID do usuário são obrigatórios' 
      });
    }
    
    if (isDbAvailable()) {
      try {
        const { notificacaoModel: Notificacao } = require('../models/indexModel');
        
        const novaNotificacao = await Notificacao.create({
          titulo,
          mensagem,
          tipo: tipoNormalizado,
          status: 'pendente',
          usuario_id: userId,
          processo_id,
          agendamento_id
        });
        
        res.status(201).json(novaNotificacao);
      } catch (dbError) {
        console.log('Erro no banco, usando modo mock:', dbError.message);
        // Fallback para modo mock
        const novaNotificacao = {
          id: Date.now(),
          titulo,
          mensagem,
          tipo: tipoNormalizado,
          status: 'pendente',
          usuario_id: userId,
          processo_id,
          agendamento_id,
          criado_em: new Date().toISOString()
        };
        
        res.status(201).json(novaNotificacao);
      }
      
    } else {
      // Modo mock
      const novaNotificacao = {
        id: Date.now(),
        titulo,
        mensagem,
        tipo: tipoNormalizado,
        status: 'pendente',
        usuario_id: userId,
        processo_id,
        agendamento_id,
        criado_em: new Date().toISOString()
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
      const { notificacaoModel: Notificacao } = require('../models/indexModel');
      
      const notificacao = await Notificacao.findByPk(id);
      if (!notificacao) {
        return res.status(404).json({ erro: 'Notificação não encontrada' });
      }
      
      await notificacao.update({ 
        status: 'lido',
        data_leitura: new Date()
      });
      res.json(notificacao);
      
    } else {
      // Modo mock - simular encontrar a notificação
      const mockData = getMockData();
      const notificacao = mockData.notificacoes.find(n => n.id == id);
      
      if (!notificacao) {
        return res.status(404).json({ erro: 'Notificação não encontrada' });
      }
      
      res.json({
        ...notificacao,
        status: 'lido',
        data_leitura: new Date().toISOString(),
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
      const { notificacaoModel: Notificacao } = require('../models/indexModel');
      
      await Notificacao.update(
        { 
          status: 'lido',
          data_leitura: new Date()
        },
        { 
          where: { 
            usuario_id: userId, 
            status: ['pendente', 'enviado'] 
          } 
        }
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
      const { notificacaoModel: Notificacao } = require('../models/indexModel');
      
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
      const { notificacaoModel: Notificacao } = require('../models/indexModel');
      count = await Notificacao.count({
        where: { 
          usuario_id: userId, 
          status: ['pendente', 'enviado'] // não lidas são pendentes ou enviadas mas não lidas
        }
      });
    } else {
      const mockData = getMockData();
      count = mockData.notificacoes.filter(n => n.usuario_id === userId && ['pendente', 'enviado'].includes(n.status)).length;
    }
    
    res.json({ count });
    
  } catch (error) {
    console.error('Erro ao contar notificações não lidas:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
