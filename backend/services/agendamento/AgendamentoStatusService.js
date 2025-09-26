/**
 * Serviço para gestão automática de status de agendamentos
 * Centraliza toda a lógica de transição de status baseada em regras de negócio
 */

const { 
  AGENDAMENTO_STATUS, 
  CONVIDADO_STATUS, 
  TEMPO_CONFIG,
  ERROR_MESSAGES 
} = require('../../config/agendamento/constants');

const ConvidadoUtilsService = require('./ConvidadoUtilsService');

class AgendamentoStatusService {
  
  /**
   * Determina o status apropriado do agendamento baseado nos convidados e data
   * @param {Array} convidados - Lista de convidados
   * @param {Date} dataAgendamento - Data do agendamento
   * @param {Date} dataConvite - Data do convite (opcional)
   * @returns {string} Status apropriado
   */
  static determineStatusFromConvidados(convidados, dataAgendamento, dataConvite = null) {
    if (!convidados || convidados.length === 0) {
      return AGENDAMENTO_STATUS.MARCADO;
    }

    const stats = ConvidadoUtilsService.analyzeConvidadosStatus(convidados);
    const agora = new Date();
    const jaPassou = dataAgendamento < agora;

    // Se o agendamento já passou
    if (jaPassou) {
      if (stats.todoResponderam && stats.todosAceitaram) {
        return AGENDAMENTO_STATUS.FINALIZADO;
      }
      if (stats.todoResponderam && stats.todosRecusaram) {
        return AGENDAMENTO_STATUS.CANCELADO;
      }
      return AGENDAMENTO_STATUS.FINALIZADO; // Status padrão para agendamentos passados
    }

    // Verificar se convites expiraram
    const convitesExpiraram = dataConvite && 
      ConvidadoUtilsService.checkConvitesExpiraram(dataConvite);

    if (convitesExpiraram) {
      // Se convites expiraram, considerar pendentes como aceitos
      return this.determineStatusAfterExpiration(stats);
    }

    // Lógica para agendamentos futuros
    if (stats.todoResponderam) {
      if (stats.todosAceitaram) {
        return AGENDAMENTO_STATUS.MARCADO;
      }
      if (stats.todosRecusaram) {
        return AGENDAMENTO_STATUS.CANCELADO;
      }
      if (stats.situacaoMista) {
        return AGENDAMENTO_STATUS.MARCADO; // Situação mista = confirmado parcial
      }
    }

    // Se ainda há pendentes
    if (stats.pendentes > 0) {
      return AGENDAMENTO_STATUS.PENDENTE;
    }

    return AGENDAMENTO_STATUS.MARCADO;
  }

  /**
   * Determina status após expiração dos convites
   * @param {Object} stats - Estatísticas dos convidados
   * @returns {string} Status apropriado
   */
  static determineStatusAfterExpiration(stats) {
    const totalRespostas = stats.aceitos + stats.recusados;
    const totalConvidados = stats.total;

    // Se ninguém respondeu, considerar como aceito (comportamento padrão)
    if (totalRespostas === 0) {
      return AGENDAMENTO_STATUS.MARCADO;
    }

    // Se há alguma resposta positiva, confirmar
    if (stats.aceitos > 0) {
      return AGENDAMENTO_STATUS.MARCADO;
    }

    // Se só há recusas
    if (stats.recusados === totalConvidados) {
      return AGENDAMENTO_STATUS.CANCELADO;
    }

    return AGENDAMENTO_STATUS.MARCADO;
  }

  /**
   * Atualiza status do agendamento automaticamente
   * @param {Object} agendamento - Objeto do agendamento
   * @returns {Object} { statusAtualizado, houveMudanca, motivoMudanca }
   */
  static updateAutomaticStatus(agendamento) {
    const convidados = ConvidadoUtilsService.parseConvidados(agendamento.convidados);
    const statusAtual = agendamento.status;
    
    const novoStatus = this.determineStatusFromConvidados(
      convidados,
      new Date(agendamento.data_hora),
      agendamento.data_convite ? new Date(agendamento.data_convite) : null
    );

    const houveMudanca = statusAtual !== novoStatus;
    let motivoMudanca = null;

    if (houveMudanca) {
      motivoMudanca = this.getStatusChangeReason(statusAtual, novoStatus, convidados);
    }

    return {
      statusAtualizado: novoStatus,
      houveMudanca,
      motivoMudanca,
      statusAnterior: statusAtual
    };
  }

  /**
   * Retorna motivo da mudança de status
   * @param {string} statusAnterior 
   * @param {string} novoStatus 
   * @param {Array} convidados 
   * @returns {string} Motivo da mudança
   */
  static getStatusChangeReason(statusAnterior, novoStatus, convidados) {
    const stats = ConvidadoUtilsService.analyzeConvidadosStatus(convidados);

    const transicoes = {
      [`${AGENDAMENTO_STATUS.PENDENTE}-${AGENDAMENTO_STATUS.MARCADO}`]: 
        'Todos os convidados aceitaram o convite',
      [`${AGENDAMENTO_STATUS.PENDENTE}-${AGENDAMENTO_STATUS.CANCELADO}`]: 
        'Todos os convidados recusaram o convite',
      [`${AGENDAMENTO_STATUS.ENVIANDO_CONVITES}-${AGENDAMENTO_STATUS.MARCADO}`]: 
        'Convites expirados - considerados como aceitos',
      [`${AGENDAMENTO_STATUS.MARCADO}-${AGENDAMENTO_STATUS.FINALIZADO}`]: 
        'Agendamento passou da data programada',
      [`${AGENDAMENTO_STATUS.PENDENTE}-${AGENDAMENTO_STATUS.FINALIZADO}`]: 
        'Agendamento passou da data programada'
    };

    const chave = `${statusAnterior}-${novoStatus}`;
    return transicoes[chave] || 'Atualização automática de status';
  }

  /**
   * Verifica se um status pode ser alterado manualmente
   * @param {string} statusAtual 
   * @param {string} novoStatus 
   * @returns {boolean} Se a alteração é permitida
   */
  static canChangeStatusManually(statusAtual, novoStatus) {
    // Status finais não podem ser alterados
    const statusFinais = [
      AGENDAMENTO_STATUS.FINALIZADO,
      AGENDAMENTO_STATUS.CANCELADO
    ];

    if (statusFinais.includes(statusAtual)) {
      return false;
    }

    // Algumas transições são apenas automáticas
    const transicoesAutomaticas = [
      AGENDAMENTO_STATUS.ENVIANDO_CONVITES,
      AGENDAMENTO_STATUS.PENDENTE
    ];

    if (transicoesAutomaticas.includes(novoStatus)) {
      return false;
    }

    return true;
  }

  /**
   * Processa mudança de status em lote para múltiplos agendamentos
   * @param {Array} agendamentos - Lista de agendamentos
   * @returns {Object} Resultado do processamento em lote
   */
  static processStatusBatch(agendamentos) {
    const resultado = {
      processados: 0,
      atualizados: 0,
      erros: [],
      detalhes: []
    };

    for (const agendamento of agendamentos) {
      try {
        const atualizacao = this.updateAutomaticStatus(agendamento);
        resultado.processados++;

        if (atualizacao.houveMudanca) {
          resultado.atualizados++;
          resultado.detalhes.push({
            id: agendamento.id,
            statusAnterior: atualizacao.statusAnterior,
            novoStatus: atualizacao.statusAtualizado,
            motivo: atualizacao.motivoMudanca
          });
        }
      } catch (error) {
        resultado.erros.push({
          id: agendamento.id,
          erro: error.message
        });
      }
    }

    return resultado;
  }

  /**
   * Valida se um agendamento precisa de atualização de status
   * @param {Object} agendamento 
   * @returns {boolean} Se precisa de atualização
   */
  static needsStatusUpdate(agendamento) {
    const atualizacao = this.updateAutomaticStatus(agendamento);
    return atualizacao.houveMudanca;
  }

  /**
   * Obtém próximas ações recomendadas baseadas no status
   * @param {Object} agendamento 
   * @returns {Array} Lista de ações recomendadas
   */
  static getRecommendedActions(agendamento) {
    const status = agendamento.status;
    const convidados = ConvidadoUtilsService.parseConvidados(agendamento.convidados);
    const stats = ConvidadoUtilsService.analyzeConvidadosStatus(convidados);
    const agora = new Date();
    const dataAgendamento = new Date(agendamento.data_hora);
    const tempoRestante = dataAgendamento.getTime() - agora.getTime();
    const horasRestantes = tempoRestante / (1000 * 60 * 60);

    const acoes = [];

    switch (status) {
      case AGENDAMENTO_STATUS.PENDENTE:
        if (stats.pendentes > 0) {
          acoes.push('Enviar lembrete para convidados pendentes');
        }
        if (horasRestantes < 24) {
          acoes.push('Considerar reagendar devido ao tempo restante');
        }
        break;

      case AGENDAMENTO_STATUS.ENVIANDO_CONVITES:
        acoes.push('Aguardar respostas dos convidados');
        if (horasRestantes < 48) {
          acoes.push('Definir se agendamento será mantido com participação parcial');
        }
        break;

      case AGENDAMENTO_STATUS.EM_ANALISE:
        acoes.push('Finalizar análise e definir status do agendamento');
        break;

      case AGENDAMENTO_STATUS.MARCADO:
        if (horasRestantes < 2) {
          acoes.push('Preparar materiais para o agendamento');
        }
        if (convidados.length > 0 && horasRestantes < 24) {
          acoes.push('Enviar lembretes finais');
        }
        break;
    }

    return acoes;
  }

  /**
   * Calcula score de prioridade do agendamento
   * @param {Object} agendamento 
   * @returns {number} Score de 0 a 100
   */
  static calculatePriorityScore(agendamento) {
    let score = 50; // Base

    const status = agendamento.status;
    const agora = new Date();
    const dataAgendamento = new Date(agendamento.data_hora);
    const tempoRestante = dataAgendamento.getTime() - agora.getTime();
    const horasRestantes = tempoRestante / (1000 * 60 * 60);

    // Pontuação por status
    const scoreStatus = {
      [AGENDAMENTO_STATUS.PENDENTE]: 80,
      [AGENDAMENTO_STATUS.ENVIANDO_CONVITES]: 75,
      [AGENDAMENTO_STATUS.EM_ANALISE]: 70,
      [AGENDAMENTO_STATUS.MARCADO]: 60,
      [AGENDAMENTO_STATUS.FINALIZADO]: 10,
      [AGENDAMENTO_STATUS.CANCELADO]: 5
    };

    score = scoreStatus[status] || score;

    // Ajuste por urgência temporal
    if (horasRestantes < 2) {
      score += 20;
    } else if (horasRestantes < 24) {
      score += 10;
    } else if (horasRestantes < 48) {
      score += 5;
    }

    // Ajuste por número de convidados
    const convidados = ConvidadoUtilsService.parseConvidados(agendamento.convidados);
    if (convidados.length > 5) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }
}

module.exports = AgendamentoStatusService;