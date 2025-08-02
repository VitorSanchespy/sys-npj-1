const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');
const { 
  notificacaoModels: Notificacao,
  configuracaoNotificacaoModels: ConfiguracaoNotificacao 
} = require('../models/indexModels');

// Listar notificações do usuário logado
router.get('/', verificarToken, async (req, res) => {
  try {
    const usuarioLogado = req.usuario;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const notificacoes = await Notificacao.findAll({
      where: {
        usuario_id: usuarioLogado.id
      },
      order: [['criado_em', 'DESC']],
      limit,
      offset
    });

    const total = await Notificacao.count({
      where: {
        usuario_id: usuarioLogado.id
      }
    });

    const naoLidas = await Notificacao.count({
      where: {
        usuario_id: usuarioLogado.id,
        data_leitura: null
      }
    });

    res.json({ 
      notificacoes,
      total,
      naoLidas,
      limit,
      offset
    });
  } catch (error) {
    console.error('Erro ao listar notificações:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// Marcar notificação como lida
router.put('/:id/lida', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioLogado = req.usuario;
    
    const notificacao = await Notificacao.findOne({
      where: {
        id,
        usuario_id: usuarioLogado.id
      }
    });
    
    if (!notificacao) {
      return res.status(404).json({ erro: 'Notificação não encontrada' });
    }
    
    await notificacao.update({ 
      status: 'lido',
      data_leitura: new Date()
    });
    
    res.json({ mensagem: 'Notificação marcada como lida' });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// Marcar todas as notificações como lidas
router.put('/marcar-todas-lidas', verificarToken, async (req, res) => {
  try {
    const usuarioLogado = req.usuario;
    
    await Notificacao.update(
      { 
        status: 'lido',
        data_leitura: new Date()
      },
      {
        where: {
          usuario_id: usuarioLogado.id,
          data_leitura: null
        }
      }
    );
    
    res.json({ mensagem: 'Todas as notificações foram marcadas como lidas' });
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// Contar notificações não lidas
router.get('/nao-lidas/contador', verificarToken, async (req, res) => {
  try {
    const usuarioLogado = req.usuario;
    
    const count = await Notificacao.count({
      where: {
        usuario_id: usuarioLogado.id,
        data_leitura: null
      }
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Erro ao contar notificações não lidas:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// Obter configurações de notificação do usuário
router.get('/configuracoes', verificarToken, async (req, res) => {
  try {
    const usuarioLogado = req.usuario;
    
    let configuracao = await ConfiguracaoNotificacao.findOne({
      where: {
        usuario_id: usuarioLogado.id
      }
    });
    
    // Se não existir, criar configuração padrão
    if (!configuracao) {
      configuracao = await ConfiguracaoNotificacao.create({
        usuario_id: usuarioLogado.id,
        email_lembretes: true,
        email_alertas: true,
        email_agendamentos: true,
        push_lembretes: true,
        push_alertas: true,
        push_agendamentos: true
      });
    }
    
    res.json({ configuracao });
  } catch (error) {
    console.error('Erro ao obter configurações:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// Atualizar configurações de notificação
router.put('/configuracoes', verificarToken, async (req, res) => {
  try {
    const usuarioLogado = req.usuario;
    const configuracoes = req.body;
    
    // Verificar se já existe configuração
    let configuracao = await ConfiguracaoNotificacao.findOne({
      where: {
        usuario_id: usuarioLogado.id
      }
    });
    
    if (configuracao) {
      // Atualizar configuração existente
      await configuracao.update(configuracoes);
    } else {
      // Criar nova configuração
      configuracao = await ConfiguracaoNotificacao.create({
        usuario_id: usuarioLogado.id,
        ...configuracoes
      });
    }
    
    res.json({ 
      mensagem: 'Configurações atualizadas com sucesso',
      configuracao 
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;
