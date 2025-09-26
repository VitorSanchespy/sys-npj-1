/**
 * Serviço de Utilidades para Convidados
 * Gerencia a lógica de convidados de forma isolada
 */

const { 
  CONVIDADO_STATUS, 
  TEMPO_CONFIG,
  ERROR_MESSAGES 
} = require('../../config/agendamento/constants');

class ConvidadoUtilsService {

  /**
   * Cria estrutura padrão para um novo convidado
   */
  static createConvidadoStructure(email, nome = null) {
    return {
      email: email.toLowerCase().trim(),
      nome: nome ? nome.trim() : null,
      status: CONVIDADO_STATUS.PENDENTE,
      data_convite: new Date(),
      data_resposta: null,
      justificativa: null
    };
  }

  /**
   * Parse seguro do campo JSON de convidados
   */
  static parseConvidados(convidadosField) {
    if (!convidadosField) {
      return [];
    }

    if (Array.isArray(convidadosField)) {
      return convidadosField;
    }

    if (typeof convidadosField === 'string') {
      try {
        return JSON.parse(convidadosField);
      } catch (error) {
        console.warn('Erro ao fazer parse de convidados JSON:', error.message);
        return [];
      }
    }

    // Se é objeto, tentar converter
    if (typeof convidadosField === 'object') {
      return Array.isArray(convidadosField) ? convidadosField : [];
    }

    return [];
  }

  /**
   * Encontra convidado por email
   */
  static findConvidadoByEmail(convidados, email) {
    const convidadosArray = this.parseConvidados(convidados);
    const emailNormalizado = email.toLowerCase().trim();
    
    return convidadosArray.find(c => 
      c.email && c.email.toLowerCase().trim() === emailNormalizado
    );
  }

  /**
   * Atualiza status de um convidado específico
   */
  static updateConvidadoStatus(convidados, email, newStatus, justificativa = null) {
    const convidadosArray = this.parseConvidados(convidados);
    const emailNormalizado = email.toLowerCase().trim();
    
    const convidadoIndex = convidadosArray.findIndex(c => 
      c.email && c.email.toLowerCase().trim() === emailNormalizado
    );

    if (convidadoIndex === -1) {
      throw new Error(ERROR_MESSAGES.EMAIL_NAO_ENCONTRADO);
    }

    const convidado = convidadosArray[convidadoIndex];

    // Verificar se já respondeu
    if (convidado.status !== CONVIDADO_STATUS.PENDENTE) {
      throw new Error(`${ERROR_MESSAGES.JA_RESPONDEU_CONVITE}: ${convidado.status}`);
    }

    // Atualizar status
    convidadosArray[convidadoIndex] = {
      ...convidado,
      status: newStatus,
      data_resposta: new Date(),
      justificativa: justificativa
    };

    return convidadosArray;
  }

  /**
   * Verifica se convites expiraram (24h)
   */
  static checkConvitesExpiraram(dataConvitesEnviados) {
    if (!dataConvitesEnviados) {
      return false;
    }

    const horasPassadas = (new Date() - new Date(dataConvitesEnviados)) / (1000 * 60 * 60);
    return horasPassadas >= TEMPO_CONFIG.EXPIRACAO_CONVITE_HORAS;
  }

  /**
   * Analisa status geral dos convidados
   */
  static analyzeConvidadosStatus(convidados) {
    const convidadosArray = this.parseConvidados(convidados);
    
    if (convidadosArray.length === 0) {
      return {
        total: 0,
        comEmailValido: 0,
        pendentes: 0,
        aceitos: 0,
        recusados: 0,
        todosAceitaram: false,
        todosRecusaram: false,
        temPendentes: false,
        todoResponderam: true,
        situacaoMista: false
      };
    }

    // Filtrar apenas convidados com email válido
    const convidadosComEmail = convidadosArray.filter(c => c.email && c.email.trim() !== '');
    
    const stats = {
      total: convidadosArray.length,
      comEmailValido: convidadosComEmail.length,
      pendentes: 0,
      aceitos: 0,
      recusados: 0
    };

    // Contar por status
    convidadosComEmail.forEach(convidado => {
      switch (convidado.status) {
        case CONVIDADO_STATUS.PENDENTE:
          stats.pendentes++;
          break;
        case CONVIDADO_STATUS.ACEITO:
          stats.aceitos++;
          break;
        case CONVIDADO_STATUS.RECUSADO:
          stats.recusados++;
          break;
      }
    });

    // Análises
    stats.todosAceitaram = stats.comEmailValido > 0 && stats.aceitos === stats.comEmailValido;
    stats.todosRecusaram = stats.comEmailValido > 0 && stats.recusados === stats.comEmailValido;
    stats.temPendentes = stats.pendentes > 0;
    stats.todoResponderam = stats.pendentes === 0;
    stats.situacaoMista = stats.aceitos > 0 && stats.recusados > 0 && stats.todoResponderam;

    return stats;
  }

  /**
   * Marca convites expirados como aceitos automaticamente
   */
  static markExpiredAsAccepted(convidados) {
    const convidadosArray = this.parseConvidados(convidados);
    let mudancas = false;

    const convidadosAtualizados = convidadosArray.map(convidado => {
      if (convidado.status === CONVIDADO_STATUS.PENDENTE) {
        mudancas = true;
        return {
          ...convidado,
          status: CONVIDADO_STATUS.ACEITO,
          data_resposta: new Date(),
          resposta_automatica: true
        };
      }
      return convidado;
    });

    return {
      convidadosAtualizados,
      houveMudancas: mudancas
    };
  }

  /**
   * Valida se email pode ser usado para operação
   */
  static validateEmailOperation(convidados, email, dataConvitesEnviados) {
    // Verificar expiração
    if (this.checkConvitesExpiraram(dataConvitesEnviados)) {
      throw new Error(ERROR_MESSAGES.CONVITE_EXPIRADO);
    }

    // Verificar se email existe na lista
    const convidado = this.findConvidadoByEmail(convidados, email);
    if (!convidado) {
      throw new Error(ERROR_MESSAGES.EMAIL_NAO_ENCONTRADO);
    }

    // Verificar se ainda está pendente
    if (convidado.status !== CONVIDADO_STATUS.PENDENTE) {
      throw new Error(`${ERROR_MESSAGES.JA_RESPONDEU_CONVITE}: ${convidado.status}`);
    }

    return convidado;
  }

  /**
   * Gera lista de emails dos convidados por status
   */
  static getEmailsByStatus(convidados, status = null) {
    const convidadosArray = this.parseConvidados(convidados);
    
    let filteredConvidados = convidadosArray.filter(c => c.email && c.email.trim() !== '');
    
    if (status) {
      filteredConvidados = filteredConvidados.filter(c => c.status === status);
    }
    
    return filteredConvidados.map(c => ({
      email: c.email,
      nome: c.nome,
      status: c.status
    }));
  }

  /**
   * Remove convidados duplicados mantendo o primeiro
   */
  static removeDuplicateEmails(convidados) {
    const convidadosArray = this.parseConvidados(convidados);
    const emailsVistos = new Set();
    
    return convidadosArray.filter(convidado => {
      const email = convidado.email?.toLowerCase().trim();
      if (!email || emailsVistos.has(email)) {
        return false;
      }
      emailsVistos.add(email);
      return true;
    });
  }

  /**
   * Sanitiza lista de convidados
   */
  static sanitizeConvidados(convidados) {
    const convidadosArray = this.parseConvidados(convidados);
    
    return convidadosArray.map(convidado => ({
      email: convidado.email ? convidado.email.toLowerCase().trim() : '',
      nome: convidado.nome ? convidado.nome.trim() : null,
      status: convidado.status || CONVIDADO_STATUS.PENDENTE,
      data_convite: convidado.data_convite || new Date(),
      data_resposta: convidado.data_resposta || null,
      justificativa: convidado.justificativa || null
    })).filter(c => c.email !== ''); // Remove entradas sem email
  }

  /**
   * Processa input de convidados para criação
   * @param {Array} convidadosInput 
   * @returns {Array}
   */
  static processConvidadosInput(convidadosInput) {
    if (!Array.isArray(convidadosInput)) return [];
    
    return convidadosInput.map(convidado => ({
      email: convidado.email?.toLowerCase()?.trim(),
      nome: convidado.nome?.trim() || '',
      status: CONVIDADO_STATUS.PENDENTE,
      data_convite: null,
      data_resposta: null,
      link_expira: null,
      justificativa: null
    }));
  }

  /**
   * Mescla convidados atuais com atualizações mantendo respostas
   * @param {Array} convidadosAtuais 
   * @param {Array} convidadosNovos 
   * @returns {Array}
   */
  static mergeConvidadosUpdate(convidadosAtuais, convidadosNovos) {
    const atuais = this.parseConvidados(convidadosAtuais);
    const novos = Array.isArray(convidadosNovos) ? convidadosNovos : [];
    
    // Mapear convidados atuais por email
    const atuaisMap = new Map();
    atuais.forEach(convidado => {
      if (convidado.email) {
        atuaisMap.set(convidado.email.toLowerCase(), convidado);
      }
    });
    
    // Processar lista nova mantendo respostas existentes
    return novos.map(novoConvidado => {
      const emailNorm = novoConvidado.email?.toLowerCase()?.trim();
      const existente = atuaisMap.get(emailNorm);
      
      if (existente) {
        // Manter dados de resposta se já respondeu
        return {
          ...novoConvidado,
          email: emailNorm,
          nome: novoConvidado.nome?.trim() || existente.nome,
          status: existente.status,
          data_convite: existente.data_convite,
          data_resposta: existente.data_resposta,
          link_expira: existente.link_expira,
          justificativa: existente.justificativa
        };
      } else {
        // Novo convidado
        return {
          email: emailNorm,
          nome: novoConvidado.nome?.trim() || '',
          status: CONVIDADO_STATUS.PENDENTE,
          data_convite: null,
          data_resposta: null,
          link_expira: null,
          justificativa: null
        };
      }
    });
  }
}

module.exports = ConvidadoUtilsService;