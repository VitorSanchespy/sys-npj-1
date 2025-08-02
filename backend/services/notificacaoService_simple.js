// Serviço de Notificação Simplificado

// Função utilitária para verificar disponibilidade do banco
function isDbAvailable() {
  return global.dbAvailable || false;
}

// Dados mock para desenvolvimento
const getMockNotifications = () => [
  {
    id: 1,
    titulo: 'Bem-vindo ao Sistema',
    mensagem: 'Seja bem-vindo ao Sistema NPJ!',
    tipo: 'info',
    usuario_id: 1,
    lida: false,
    data_criacao: new Date().toISOString()
  }
];

class NotificacaoService {
  constructor(io = null) {
    this.io = io;
  }

  // Enviar notificação via WebSocket (se disponível)
  enviarParaUsuario(usuarioId, mensagem) {
    if (this.io) {
      this.io.to(`usuario_${usuarioId}`).emit('notificacao_pessoal', {
        mensagem,
        data: new Date()
      });
    }
  }

  // Enviar para processo específico
  enviarParaProcesso(processoId, mensagem) {
    if (this.io) {
      this.io.to(`processo_${processoId}`).emit('notificacao', {
        processoId,
        mensagem,
        data: new Date()
      });
    }
  }

  // Criar notificação
  async criarNotificacao(usuarioId, titulo, mensagem, tipo = 'info', dadosAdicionais = {}) {
    try {
      let notificacao;

      if (isDbAvailable()) {
        const { notificacaoModels: Notificacao } = require('../models/indexModels');
        
        notificacao = await Notificacao.create({
          usuario_id: usuarioId,
          titulo,
          mensagem,
          tipo,
          processo_id: dadosAdicionais.processo_id || null,
          agendamento_id: dadosAdicionais.agendamento_id || null,
          lida: false,
          data_criacao: new Date()
        });
      } else {
        // Simular criação
        notificacao = {
          id: Date.now(),
          usuario_id: usuarioId,
          titulo,
          mensagem,
          tipo,
          lida: false,
          data_criacao: new Date().toISOString()
        };
      }

      // Enviar via WebSocket se disponível
      this.enviarParaUsuario(usuarioId, {
        titulo,
        mensagem,
        tipo
      });

      return notificacao;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  }

  // Marcar como lida
  async marcarComoLida(notificacaoId, usuarioId) {
    try {
      if (isDbAvailable()) {
        const { notificacaoModels: Notificacao } = require('../models/indexModels');
        
        await Notificacao.update(
          { lida: true, data_leitura: new Date() },
          { 
            where: { 
              id: notificacaoId,
              usuario_id: usuarioId 
            }
          }
        );
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }
  }

  // Listar notificações do usuário
  async listarNotificacoesUsuario(usuarioId, limite = 50) {
    try {
      let notificacoes = [];

      if (isDbAvailable()) {
        const { notificacaoModels: Notificacao } = require('../models/indexModels');
        
        notificacoes = await Notificacao.findAll({
          where: { usuario_id: usuarioId },
          order: [['data_criacao', 'DESC']],
          limit: limite
        });
      } else {
        // Retornar notificações mock
        notificacoes = getMockNotifications().filter(n => n.usuario_id === usuarioId);
      }

      return notificacoes;
    } catch (error) {
      console.error('Erro ao listar notificações:', error);
      throw error;
    }
  }

  // Contar não lidas
  async contarNaoLidas(usuarioId) {
    try {
      let count = 0;

      if (isDbAvailable()) {
        const { notificacaoModels: Notificacao } = require('../models/indexModels');
        
        count = await Notificacao.count({
          where: { 
            usuario_id: usuarioId,
            lida: false
          }
        });
      } else {
        // Contar mock
        count = getMockNotifications().filter(n => 
          n.usuario_id === usuarioId && !n.lida
        ).length;
      }

      return count;
    } catch (error) {
      console.error('Erro ao contar notificações não lidas:', error);
      return 0;
    }
  }

  // Notificações do sistema
  async notificarProcessoCriado(usuarioId, processoId, numeroProcesso) {
    return await this.criarNotificacao(
      usuarioId,
      'Processo Criado',
      `Novo processo ${numeroProcesso} foi criado com sucesso.`,
      'success',
      { processo_id: processoId }
    );
  }

  async notificarAgendamentoCriado(usuarioId, agendamentoId, titulo) {
    return await this.criarNotificacao(
      usuarioId,
      'Agendamento Criado',
      `Novo agendamento "${titulo}" foi criado.`,
      'info',
      { agendamento_id: agendamentoId }
    );
  }

  async notificarProcessoAtualizado(usuarioId, processoId, numeroProcesso) {
    return await this.criarNotificacao(
      usuarioId,
      'Processo Atualizado',
      `Processo ${numeroProcesso} foi atualizado.`,
      'info',
      { processo_id: processoId }
    );
  }
}

module.exports = NotificacaoService;
