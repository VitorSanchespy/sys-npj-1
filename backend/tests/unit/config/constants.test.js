/**
 * Testes unitários para as constantes do sistema de agendamentos
 */

const {
  AGENDAMENTO_STATUS,
  CONVIDADO_STATUS,
  AGENDAMENTO_TIPOS,
  AGENDAMENTO_LIMITS,
  TEMPO_CONFIG,
  USER_ROLES,
  AUTO_APPROVE_ROLES,
  REGEX_PATTERNS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} = require('../../../config/agendamento/constants');

describe('Constantes do Sistema de Agendamentos', () => {
  
  describe('AGENDAMENTO_STATUS', () => {
    test('deve conter todos os status necessários', () => {
      expect(AGENDAMENTO_STATUS).toHaveProperty('EM_ANALISE');
      expect(AGENDAMENTO_STATUS).toHaveProperty('ENVIANDO_CONVITES');
      expect(AGENDAMENTO_STATUS).toHaveProperty('PENDENTE');
      expect(AGENDAMENTO_STATUS).toHaveProperty('MARCADO');
      expect(AGENDAMENTO_STATUS).toHaveProperty('CANCELADO');
      expect(AGENDAMENTO_STATUS).toHaveProperty('FINALIZADO');
    });

    test('valores dos status devem estar corretos', () => {
      expect(AGENDAMENTO_STATUS.EM_ANALISE).toBe('em_analise');
      expect(AGENDAMENTO_STATUS.PENDENTE).toBe('pendente');
      expect(AGENDAMENTO_STATUS.MARCADO).toBe('marcado');
      expect(AGENDAMENTO_STATUS.CANCELADO).toBe('cancelado');
    });
  });

  describe('CONVIDADO_STATUS', () => {
    test('deve conter todos os status de convidado', () => {
      expect(CONVIDADO_STATUS).toHaveProperty('PENDENTE');
      expect(CONVIDADO_STATUS).toHaveProperty('ACEITO');
      expect(CONVIDADO_STATUS).toHaveProperty('RECUSADO');
    });

    test('valores devem estar corretos', () => {
      expect(CONVIDADO_STATUS.PENDENTE).toBe('pendente');
      expect(CONVIDADO_STATUS.ACEITO).toBe('aceito');
      expect(CONVIDADO_STATUS.RECUSADO).toBe('recusado');
    });
  });

  describe('AGENDAMENTO_LIMITS', () => {
    test('deve ter limites numéricos válidos', () => {
      expect(typeof AGENDAMENTO_LIMITS.MAX_CONVIDADOS).toBe('number');
      expect(AGENDAMENTO_LIMITS.MAX_CONVIDADOS).toBeGreaterThan(0);
      expect(AGENDAMENTO_LIMITS.MAX_CONVIDADOS).toBe(10);
      
      expect(AGENDAMENTO_LIMITS.MAX_NOME_LENGTH).toBeGreaterThan(0);
      expect(AGENDAMENTO_LIMITS.MIN_TITULO_LENGTH).toBeGreaterThan(0);
      expect(AGENDAMENTO_LIMITS.MIN_TITULO_LENGTH).toBeLessThan(AGENDAMENTO_LIMITS.MAX_TITULO_LENGTH);
    });
  });

  describe('TEMPO_CONFIG', () => {
    test('deve ter configurações de tempo válidas', () => {
      expect(typeof TEMPO_CONFIG.EXPIRACAO_CONVITE_HORAS).toBe('number');
      expect(TEMPO_CONFIG.EXPIRACAO_CONVITE_HORAS).toBe(24);
      
      expect(typeof TEMPO_CONFIG.LEMBRETE_ANTECEDENCIA_HORAS).toBe('number');
      expect(TEMPO_CONFIG.LEMBRETE_ANTECEDENCIA_HORAS).toBe(1);
    });
  });

  describe('USER_ROLES', () => {
    test('deve conter todos os roles necessários', () => {
      expect(USER_ROLES).toHaveProperty('ADMIN');
      expect(USER_ROLES).toHaveProperty('PROFESSOR');
      expect(USER_ROLES).toHaveProperty('ALUNO');
    });

    test('AUTO_APPROVE_ROLES deve conter apenas Admin e Professor', () => {
      expect(AUTO_APPROVE_ROLES).toContain(USER_ROLES.ADMIN);
      expect(AUTO_APPROVE_ROLES).toContain(USER_ROLES.PROFESSOR);
      expect(AUTO_APPROVE_ROLES).not.toContain(USER_ROLES.ALUNO);
      expect(AUTO_APPROVE_ROLES).toHaveLength(2);
    });
  });

  describe('REGEX_PATTERNS', () => {
    test('regex de email deve validar emails corretos', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'usuario@teste.com.br'
      ];

      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@.com'
      ];

      validEmails.forEach(email => {
        expect(REGEX_PATTERNS.EMAIL.test(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(REGEX_PATTERNS.EMAIL.test(email)).toBe(false);
      });
    });
  });

  describe('ERROR_MESSAGES', () => {
    test('deve conter todas as mensagens de erro necessárias', () => {
      expect(ERROR_MESSAGES).toHaveProperty('AGENDAMENTO_NAO_ENCONTRADO');
      expect(ERROR_MESSAGES).toHaveProperty('EMAIL_INVALIDO');
      expect(ERROR_MESSAGES).toHaveProperty('LIMITE_CONVIDADOS_EXCEDIDO');
      
      // Verificar se são strings não vazias
      Object.values(ERROR_MESSAGES).forEach(message => {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });

  describe('SUCCESS_MESSAGES', () => {
    test('deve conter todas as mensagens de sucesso necessárias', () => {
      expect(SUCCESS_MESSAGES).toHaveProperty('AGENDAMENTO_CRIADO');
      expect(SUCCESS_MESSAGES).toHaveProperty('CONVITE_ACEITO');
      
      // Verificar se são strings não vazias
      Object.values(SUCCESS_MESSAGES).forEach(message => {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Integridade geral', () => {
    test('não deve haver valores undefined ou null', () => {
      const allConstants = {
        ...AGENDAMENTO_STATUS,
        ...CONVIDADO_STATUS,
        ...AGENDAMENTO_TIPOS,
        ...AGENDAMENTO_LIMITS,
        ...TEMPO_CONFIG,
        ...USER_ROLES,
        ...ERROR_MESSAGES,
        ...SUCCESS_MESSAGES
      };

      Object.values(allConstants).forEach(value => {
        expect(value).toBeDefined();
        expect(value).not.toBeNull();
      });
    });
  });
});