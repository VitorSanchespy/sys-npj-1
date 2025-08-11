// Controller de Notificações simplificado

// Função utilitária para verificar disponibilidade do banco
function isDbAvailable() {
  return global.dbAvailable || false;
}

// Listar notificações
exports.listarNotificacoes = async (req, res) => {
  try {
    if (!isDbAvailable()) {
      return res.status(503).json({ erro: 'Banco de dados não disponível' });
    }

    const { notificacaoModel: Notificacao, usuarioModel: Usuario } = require('../models/indexModel');
    const notificacoes = await Notificacao.findAll({
      include: [{ model: Usuario, as: 'usuario' }],
      order: [['criado_em', 'DESC']]
    });
    res.json(notificacoes);
  } catch (error) {
    console.error('Erro ao listar notificações:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar notificações do usuário com estatísticas
exports.listarNotificacoesUsuario = async (req, res) => {
  try {
    if (!isDbAvailable()) {
      return res.status(503).json({ notificacoes: [], total: 0, naoLidas: 0 });
    }

    const userId = req.user.id;
    const { notificacaoModel: Notificacao } = require('../models/indexModel');
    const notificacoes = await Notificacao.findAll({
      where: { usuario_id: userId },
      order: [['criado_em', 'DESC']]
    });
    const total = notificacoes.length;
    const naoLidas = notificacoes.filter(n => ['pendente', 'enviado'].includes(n.status)).length;
    res.json({ notificacoes, total, naoLidas });
  } catch (error) {
    console.error('Erro ao listar notificações do usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Obter notificação por ID
exports.obterNotificacao = async (req, res) => {
  try {
    if (!isDbAvailable()) {
      return res.status(503).json({ erro: 'Banco de dados não disponível' });
    }

    const { id } = req.params;
    const { notificacaoModel: Notificacao, usuarioModel: Usuario } = require('../models/indexModel');
    const notificacao = await Notificacao.findByPk(id, {
      include: [{ model: Usuario, as: 'usuario' }]
    });
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
    if (!isDbAvailable()) {
      return res.status(503).json({ erro: 'Banco de dados não disponível' });
    }

    const {
      titulo,
      mensagem,
      tipo = 'informacao',
      usuario_id,
      idusuario, // suporte para formato alternativo
      processo_id
    } = req.body;

    // Aceita tanto usuario_id quanto idusuario para compatibilidade
    const userId = usuario_id || idusuario;

    // Normalizar o tipo para valores aceitos
    const tipoNormalizado = ['lembrete', 'alerta', 'informacao', 'sistema'].includes(tipo) 
      ? tipo 
      : 'informacao';

    if (!titulo || !mensagem || !userId) {
      return res.status(400).json({ 
        erro: 'Título, mensagem e ID do usuário são obrigatórios' 
      });
    }

    const { notificacaoModel: Notificacao } = require('../models/indexModel');
    const novaNotificacao = await Notificacao.create({
      titulo,
      mensagem,
      tipo: tipoNormalizado,
      status: 'pendente',
      usuario_id: userId,
      processo_id,
      data_envio: new Date(),
      criado_em: new Date()
    });

    res.status(201).json(novaNotificacao);
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Marcar notificação como lida
exports.marcarComoLida = async (req, res) => {
  try {
    if (!isDbAvailable()) {
      return res.status(503).json({ erro: 'Banco de dados não disponível' });
    }

    const { id } = req.params;
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
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Marcar todas as notificações do usuário como lidas
exports.marcarTodasComoLidas = async (req, res) => {
  try {
    if (!isDbAvailable()) {
      return res.status(503).json({ erro: 'Banco de dados não disponível' });
    }

    const userId = req.user.id;
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
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Deletar notificação
exports.deletarNotificacao = async (req, res) => {
  try {
    if (!isDbAvailable()) {
      return res.status(503).json({ erro: 'Banco de dados não disponível' });
    }

    const { id } = req.params;
    const { notificacaoModel: Notificacao } = require('../models/indexModel');
    const notificacao = await Notificacao.findByPk(id);
    if (!notificacao) {
      return res.status(404).json({ erro: 'Notificação não encontrada' });
    }
    await notificacao.destroy();
    res.json({ message: 'Notificação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Contar notificações não lidas do usuário
exports.contarNaoLidas = async (req, res) => {
  try {
    if (!isDbAvailable()) {
      return res.json({ count: 0 });
    }

    const userId = req.user.id;
    const { notificacaoModel: Notificacao } = require('../models/indexModel');
    const count = await Notificacao.count({
      where: { 
        usuario_id: userId, 
        status: ['pendente', 'enviado']
      }
    });
    res.json({ count });
  } catch (error) {
    console.error('Erro ao contar notificações não lidas:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Obter configurações de notificação do usuário logado
exports.obterConfiguracoesNotificacao = async (req, res) => {
  try {
    if (!isDbAvailable()) {
      return res.status(503).json({ erro: 'Banco de dados não disponível' });
    }

    const userId = req.user.id;
    const { configuracaoNotificacaoModel: ConfiguracaoNotificacao } = require('../models/indexModel');
    let configuracao = await ConfiguracaoNotificacao.findOne({ where: { usuario_id: userId } });

    // Se não existir, cria configuração padrão
    if (!configuracao) {
      configuracao = await ConfiguracaoNotificacao.create({ usuario_id: userId });
    }

    res.json({ configuracao });
  } catch (error) {
    console.error('Erro ao obter configurações de notificação:', error);
    res.status(500).json({ erro: 'Erro ao obter configurações de notificação' });
  }
};

// Atualizar configurações de notificação do usuário logado
exports.atualizarConfiguracoesNotificacao = async (req, res) => {
  try {
    if (!isDbAvailable()) {
      return res.status(503).json({ erro: 'Banco de dados não disponível' });
    }

    const userId = req.user.id;
    const { configuracaoNotificacaoModel: ConfiguracaoNotificacao } = require('../models/indexModel');
    let configuracao = await ConfiguracaoNotificacao.findOne({ where: { usuario_id: userId } });

    if (!configuracao) {
      configuracao = await ConfiguracaoNotificacao.create({ usuario_id: userId });
    }

    await configuracao.update(req.body);

    res.json({ configuracao });
  } catch (error) {
    console.error('Erro ao atualizar configurações de notificação:', error);
    res.status(500).json({ erro: 'Erro ao atualizar configurações de notificação' });
  }
};
