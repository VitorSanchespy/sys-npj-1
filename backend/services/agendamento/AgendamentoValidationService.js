/**
 * Serviço de Validação para Agendamentos
 * Centraliza todas as validações de entrada e regras de negócio
 */

const {
  AGENDAMENTO_LIMITS,
  REGEX_PATTERNS,
  ERROR_MESSAGES,
  AGENDAMENTO_STATUS,
  AGENDAMENTO_TIPOS,
  CONVIDADO_STATUS
} = require('../../config/agendamento/constants');

class AgendamentoValidationService {
  
  /**
   * Valida dados básicos do agendamento
   */
  static validateBasicData(data) {
    const errors = [];

    // Validar título
    if (!data.titulo || typeof data.titulo !== 'string') {
      errors.push('Título é obrigatório');
    } else {
      const titulo = data.titulo.trim();
      if (titulo.length < AGENDAMENTO_LIMITS.MIN_TITULO_LENGTH) {
        errors.push(`Título deve ter pelo menos ${AGENDAMENTO_LIMITS.MIN_TITULO_LENGTH} caracteres`);
      }
      if (titulo.length > AGENDAMENTO_LIMITS.MAX_TITULO_LENGTH) {
        errors.push(`Título deve ter no máximo ${AGENDAMENTO_LIMITS.MAX_TITULO_LENGTH} caracteres`);
      }
    }

    // Validar datas
    if (!data.data_inicio) {
      errors.push('Data de início é obrigatória');
    } else {
      const dataInicio = new Date(data.data_inicio);
      if (isNaN(dataInicio.getTime())) {
        errors.push('Data de início deve ser uma data válida');
      } else {
        // Verificar se a data não é no passado (com tolerância de 1 minuto)
        const agora = new Date();
        agora.setMinutes(agora.getMinutes() - 1);
        if (dataInicio < agora) {
          errors.push('Data de início não pode ser no passado');
        }
      }
    }

    if (!data.data_fim) {
      errors.push('Data de fim é obrigatória');
    } else {
      const dataFim = new Date(data.data_fim);
      if (isNaN(dataFim.getTime())) {
        errors.push('Data de fim deve ser uma data válida');
      } else if (data.data_inicio) {
        const dataInicio = new Date(data.data_inicio);
        if (!isNaN(dataInicio.getTime()) && dataFim <= dataInicio) {
          errors.push('Data de fim deve ser posterior à data de início');
        }
      }
    }

    // Validar tipo
    if (data.tipo && !Object.values(AGENDAMENTO_TIPOS).includes(data.tipo)) {
      errors.push(`Tipo deve ser um dos valores: ${Object.values(AGENDAMENTO_TIPOS).join(', ')}`);
    }

    // Validar campos opcionais com limite de tamanho
    if (data.descricao && data.descricao.length > AGENDAMENTO_LIMITS.MAX_DESCRICAO_LENGTH) {
      errors.push(`Descrição deve ter no máximo ${AGENDAMENTO_LIMITS.MAX_DESCRICAO_LENGTH} caracteres`);
    }

    if (data.local && data.local.length > AGENDAMENTO_LIMITS.MAX_LOCAL_LENGTH) {
      errors.push(`Local deve ter no máximo ${AGENDAMENTO_LIMITS.MAX_LOCAL_LENGTH} caracteres`);
    }

    if (data.observacoes && data.observacoes.length > AGENDAMENTO_LIMITS.MAX_OBSERVACOES_LENGTH) {
      errors.push(`Observações devem ter no máximo ${AGENDAMENTO_LIMITS.MAX_OBSERVACOES_LENGTH} caracteres`);
    }

    // Validar email de lembrete
    if (data.email_lembrete && !this.validateEmail(data.email_lembrete)) {
      errors.push(ERROR_MESSAGES.EMAIL_INVALIDO + ': ' + data.email_lembrete);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida lista de convidados
   */
  static validateConvidados(convidados) {
    const errors = [];

    if (!Array.isArray(convidados)) {
      return {
        isValid: false,
        errors: ['Convidados deve ser um array']
      };
    }

    // Verificar limite máximo
    if (convidados.length > AGENDAMENTO_LIMITS.MAX_CONVIDADOS) {
      errors.push(`${ERROR_MESSAGES.LIMITE_CONVIDADOS_EXCEDIDO}. Máximo: ${AGENDAMENTO_LIMITS.MAX_CONVIDADOS}, fornecido: ${convidados.length}`);
    }

    const emailsVistos = new Set();

    convidados.forEach((convidado, index) => {
      const convidadoErrors = this.validateSingleConvidado(convidado, index, emailsVistos);
      errors.push(...convidadoErrors);
    });

    return {
      isValid: errors.length === 0,
      errors,
      totalConvidados: convidados.length,
      emailsUnicos: emailsVistos.size
    };
  }

  /**
   * Valida um único convidado
   */
  static validateSingleConvidado(convidado, index, emailsVistos) {
    const errors = [];
    const posicao = `Convidado ${index + 1}`;

    // Validar estrutura básica
    if (!convidado || typeof convidado !== 'object') {
      errors.push(`${posicao}: deve ser um objeto válido`);
      return errors;
    }

    // Validar email
    if (!convidado.email || typeof convidado.email !== 'string') {
      errors.push(`${posicao}: email é obrigatório`);
    } else {
      const email = convidado.email.toLowerCase().trim();
      
      if (!this.validateEmail(email)) {
        errors.push(`${posicao}: ${ERROR_MESSAGES.EMAIL_INVALIDO} - ${email}`);
      } else {
        // Verificar duplicatas
        if (emailsVistos.has(email)) {
          errors.push(`${posicao}: ${ERROR_MESSAGES.EMAIL_DUPLICADO} - ${email}`);
        } else {
          emailsVistos.add(email);
        }
      }
    }

    // Validar nome (opcional)
    if (convidado.nome) {
      if (typeof convidado.nome !== 'string') {
        errors.push(`${posicao}: nome deve ser uma string`);
      } else if (convidado.nome.trim().length > AGENDAMENTO_LIMITS.MAX_NOME_LENGTH) {
        errors.push(`${posicao}: nome deve ter no máximo ${AGENDAMENTO_LIMITS.MAX_NOME_LENGTH} caracteres`);
      }
    }

    return errors;
  }

  /**
   * Valida email usando regex
   */
  static validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }
    return REGEX_PATTERNS.EMAIL.test(email.trim());
  }

  /**
   * Valida status de agendamento
   */
  static validateStatus(status) {
    return Object.values(AGENDAMENTO_STATUS).includes(status);
  }

  /**
   * Valida status de convidado
   */
  static validateConvidadoStatus(status) {
    return Object.values(CONVIDADO_STATUS).includes(status);
  }

  /**
   * Valida se usuário pode auto-aprovar
   */
  static validateAutoApprove(userRole) {
    const { AUTO_APPROVE_ROLES } = require('../../config/agendamento/constants');
    return AUTO_APPROVE_ROLES.includes(userRole);
  }

  /**
   * Valida dados para atualização (campos opcionais)
   */
  static validateUpdateData(data) {
    const errors = [];

    // Se fornecido, validar com as mesmas regras
    if (data.titulo !== undefined) {
      const tituloValidation = this.validateBasicData({ titulo: data.titulo });
      if (!tituloValidation.isValid) {
        errors.push(...tituloValidation.errors);
      }
    }

    if (data.data_inicio !== undefined || data.data_fim !== undefined) {
      const dataValidation = this.validateBasicData({
        data_inicio: data.data_inicio,
        data_fim: data.data_fim
      });
      if (!dataValidation.isValid) {
        errors.push(...dataValidation.errors);
      }
    }

    if (data.convidados !== undefined) {
      const convidadosValidation = this.validateConvidados(data.convidados);
      if (!convidadosValidation.isValid) {
        errors.push(...convidadosValidation.errors);
      }
    }

    if (data.status !== undefined && !this.validateStatus(data.status)) {
      errors.push(`Status inválido: ${data.status}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida dados de resposta de convite
   * @param {string} resposta - Resposta do convite (aceito/recusado)
   * @param {string} justificativa - Justificativa opcional
   * @returns {Object} Resultado da validação
   */
  static validateRespostaConvite(resposta, justificativa) {
    const errors = [];

    // Validar resposta
    if (!resposta || typeof resposta !== 'string') {
      errors.push('Resposta é obrigatória');
    } else if (!['aceito', 'recusado'].includes(resposta.toLowerCase())) {
      errors.push('Resposta deve ser "aceito" ou "recusado"');
    }

    // Validar justificativa para recusa
    if (resposta === 'recusado' && justificativa && justificativa.length > 500) {
      errors.push('Justificativa não pode exceder 500 caracteres');
    }

    return {
      valid: errors.length === 0,
      errors,
      message: errors.length > 0 ? errors[0] : null
    };
  }

  /**
   * Sanitiza dados de entrada
   */
  static sanitizeData(data) {
    const sanitized = { ...data };

    // Trimmar strings
    if (sanitized.titulo) sanitized.titulo = sanitized.titulo.trim();
    if (sanitized.descricao) sanitized.descricao = sanitized.descricao.trim();
    if (sanitized.local) sanitized.local = sanitized.local.trim();
    if (sanitized.observacoes) sanitized.observacoes = sanitized.observacoes.trim();
    if (sanitized.email_lembrete) sanitized.email_lembrete = sanitized.email_lembrete.toLowerCase().trim();

    // Sanitizar convidados
    if (sanitized.convidados && Array.isArray(sanitized.convidados)) {
      sanitized.convidados = sanitized.convidados.map(convidado => ({
        ...convidado,
        email: convidado.email ? convidado.email.toLowerCase().trim() : convidado.email,
        nome: convidado.nome ? convidado.nome.trim() : convidado.nome
      }));
    }

    return sanitized;
  }
}

module.exports = AgendamentoValidationService;