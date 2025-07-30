const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');
const { notificacaoModels: Notificacao } = require('../models/indexModels');

// Listar notificações do usuário logado
router.get('/', verificarToken, async (req, res) => {
  try {
    const usuarioLogado = req.usuario;
    
    const notificacoes = await Notificacao.findAll({
      where: {
        usuario_id: usuarioLogado.id
      },
      order: [['criado_em', 'DESC']],
      limit: 50 // Limitar a 50 notificações mais recentes
    });

    res.json(notificacoes);
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
    
    await notificacao.update({ lida: true });
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
      { lida: true },
      {
        where: {
          usuario_id: usuarioLogado.id,
          lida: false
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
router.get('/nao-lidas/count', verificarToken, async (req, res) => {
  try {
    const usuarioLogado = req.usuario;
    
    const count = await Notificacao.count({
      where: {
        usuario_id: usuarioLogado.id,
        lida: false
      }
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Erro ao contar notificações não lidas:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;
