/**
 * Testes unitários para ConvidadoUtilsService
 */

const ConvidadoUtilsService = require('../../../../services/agendamento/ConvidadoUtilsService');
const { CONVIDADO_STATUS, TEMPO_CONFIG, ERROR_MESSAGES } = require('../../../../config/agendamento/constants');

describe('ConvidadoUtilsService', () => {

  describe('createConvidadoStructure', () => {
    test('deve criar estrutura básica de convidado', () => {
      const email = 'test@example.com';
      const nome = 'João Silva';
      
      const convidado = ConvidadoUtilsService.createConvidadoStructure(email, nome);
      
      expect(convidado.email).toBe('test@example.com');
      expect(convidado.nome).toBe('João Silva');
      expect(convidado.status).toBe(CONVIDADO_STATUS.PENDENTE);
      expect(convidado.data_convite).toBeInstanceOf(Date);
      expect(convidado.data_resposta).toBeNull();
      expect(convidado.justificativa).toBeNull();
    });

    test('deve normalizar email para lowercase', () => {
      const convidado = ConvidadoUtilsService.createConvidadoStructure('TEST@EXAMPLE.COM');
      expect(convidado.email).toBe('test@example.com');
    });

    test('deve criar sem nome quando não fornecido', () => {
      const convidado = ConvidadoUtilsService.createConvidadoStructure('test@example.com');
      expect(convidado.nome).toBeNull();
    });
  });

  describe('parseConvidados', () => {
    test('deve retornar array vazio para valores falsy', () => {
      expect(ConvidadoUtilsService.parseConvidados(null)).toEqual([]);
      expect(ConvidadoUtilsService.parseConvidados(undefined)).toEqual([]);
      expect(ConvidadoUtilsService.parseConvidados('')).toEqual([]);
    });

    test('deve retornar array se já é array', () => {
      const convidados = [{ email: 'test@example.com' }];
      expect(ConvidadoUtilsService.parseConvidados(convidados)).toEqual(convidados);
    });

    test('deve fazer parse de string JSON válida', () => {
      const convidadosJson = '[{"email":"test@example.com","nome":"Teste"}]';
      const resultado = ConvidadoUtilsService.parseConvidados(convidadosJson);
      
      expect(resultado).toHaveLength(1);
      expect(resultado[0].email).toBe('test@example.com');
    });

    test('deve retornar array vazio para JSON inválido', () => {
      const jsonInvalido = '{"email": invalid json}';
      expect(ConvidadoUtilsService.parseConvidados(jsonInvalido)).toEqual([]);
    });
  });

  describe('findConvidadoByEmail', () => {
    const convidados = [
      { email: 'test1@example.com', nome: 'Teste 1' },
      { email: 'test2@example.com', nome: 'Teste 2' }
    ];

    test('deve encontrar convidado por email', () => {
      const convidado = ConvidadoUtilsService.findConvidadoByEmail(convidados, 'test1@example.com');
      expect(convidado).toBeDefined();
      expect(convidado.nome).toBe('Teste 1');
    });

    test('deve ser case-insensitive', () => {
      const convidado = ConvidadoUtilsService.findConvidadoByEmail(convidados, 'TEST1@EXAMPLE.COM');
      expect(convidado).toBeDefined();
      expect(convidado.nome).toBe('Teste 1');
    });

    test('deve retornar undefined para email não encontrado', () => {
      const convidado = ConvidadoUtilsService.findConvidadoByEmail(convidados, 'naoexiste@example.com');
      expect(convidado).toBeUndefined();
    });
  });

  describe('updateConvidadoStatus', () => {
    test('deve atualizar status de convidado pendente', () => {
      const convidados = [
        { 
          email: 'test@example.com', 
          nome: 'Teste',
          status: CONVIDADO_STATUS.PENDENTE,
          data_convite: new Date(),
          data_resposta: null,
          justificativa: null
        }
      ];

      const resultado = ConvidadoUtilsService.updateConvidadoStatus(
        convidados, 
        'test@example.com', 
        CONVIDADO_STATUS.ACEITO
      );

      expect(resultado[0].status).toBe(CONVIDADO_STATUS.ACEITO);
      expect(resultado[0].data_resposta).toBeInstanceOf(Date);
    });

    test('deve incluir justificativa quando fornecida', () => {
      const convidados = [
        { 
          email: 'test@example.com', 
          nome: 'Teste',
          status: CONVIDADO_STATUS.PENDENTE,
          data_convite: new Date(),
          data_resposta: null,
          justificativa: null
        }
      ];

      const justificativa = 'Não posso comparecer';
      const resultado = ConvidadoUtilsService.updateConvidadoStatus(
        convidados,
        'test@example.com',
        CONVIDADO_STATUS.RECUSADO,
        justificativa
      );

      expect(resultado[0].justificativa).toBe(justificativa);
    });

    test('deve lançar erro para email não encontrado', () => {
      const convidados = [
        { 
          email: 'test@example.com', 
          nome: 'Teste',
          status: CONVIDADO_STATUS.PENDENTE,
          data_convite: new Date(),
          data_resposta: null,
          justificativa: null
        }
      ];

      expect(() => {
        ConvidadoUtilsService.updateConvidadoStatus(
          convidados,
          'naoexiste@example.com',
          CONVIDADO_STATUS.ACEITO
        );
      }).toThrow(ERROR_MESSAGES.EMAIL_NAO_ENCONTRADO);
    });

    test('deve lançar erro se convidado já respondeu', () => {
      const convidadosRespondidos = [
        { 
          email: 'test@example.com',
          status: CONVIDADO_STATUS.ACEITO,
          data_resposta: new Date()
        }
      ];

      expect(() => {
        ConvidadoUtilsService.updateConvidadoStatus(
          convidadosRespondidos,
          'test@example.com',
          CONVIDADO_STATUS.RECUSADO
        );
      }).toThrow(ERROR_MESSAGES.JA_RESPONDEU_CONVITE);
    });
  });

  describe('checkConvitesExpiraram', () => {
    test('deve retornar false para data null/undefined', () => {
      expect(ConvidadoUtilsService.checkConvitesExpiraram(null)).toBe(false);
      expect(ConvidadoUtilsService.checkConvitesExpiraram(undefined)).toBe(false);
    });

    test('deve retornar false para convites recentes', () => {
      const dataRecente = new Date();
      dataRecente.setHours(dataRecente.getHours() - 1); // 1 hora atrás
      
      expect(ConvidadoUtilsService.checkConvitesExpiraram(dataRecente)).toBe(false);
    });

    test('deve retornar true para convites expirados', () => {
      const dataExpirada = new Date();
      dataExpirada.setHours(dataExpirada.getHours() - (TEMPO_CONFIG.EXPIRACAO_CONVITE_HORAS + 1));
      
      expect(ConvidadoUtilsService.checkConvitesExpiraram(dataExpirada)).toBe(true);
    });
  });

  describe('analyzeConvidadosStatus', () => {
    test('deve analisar lista vazia', () => {
      const stats = ConvidadoUtilsService.analyzeConvidadosStatus([]);
      
      expect(stats.total).toBe(0);
      expect(stats.comEmailValido).toBe(0);
      expect(stats.todosAceitaram).toBe(false);
      expect(stats.todosRecusaram).toBe(false);
      expect(stats.todoResponderam).toBe(true);
    });

    test('deve analisar todos aceitos', () => {
      const convidados = [
        { email: 'test1@example.com', status: CONVIDADO_STATUS.ACEITO },
        { email: 'test2@example.com', status: CONVIDADO_STATUS.ACEITO }
      ];

      const stats = ConvidadoUtilsService.analyzeConvidadosStatus(convidados);
      
      expect(stats.total).toBe(2);
      expect(stats.aceitos).toBe(2);
      expect(stats.todosAceitaram).toBe(true);
      expect(stats.todosRecusaram).toBe(false);
    });

    test('deve identificar situação mista', () => {
      const convidados = [
        { email: 'test1@example.com', status: CONVIDADO_STATUS.ACEITO },
        { email: 'test2@example.com', status: CONVIDADO_STATUS.RECUSADO }
      ];

      const stats = ConvidadoUtilsService.analyzeConvidadosStatus(convidados);
      
      expect(stats.aceitos).toBe(1);
      expect(stats.recusados).toBe(1);
      expect(stats.situacaoMista).toBe(true);
      expect(stats.todoResponderam).toBe(true);
    });
  });

  describe('markExpiredAsAccepted', () => {
    test('deve marcar pendentes como aceitos', () => {
      const convidados = [
        { email: 'test1@example.com', status: CONVIDADO_STATUS.PENDENTE },
        { email: 'test2@example.com', status: CONVIDADO_STATUS.ACEITO } // Já aceito
      ];

      const resultado = ConvidadoUtilsService.markExpiredAsAccepted(convidados);
      
      expect(resultado.houveMudancas).toBe(true);
      expect(resultado.convidadosAtualizados[0].status).toBe(CONVIDADO_STATUS.ACEITO);
      expect(resultado.convidadosAtualizados[0].resposta_automatica).toBe(true);
      expect(resultado.convidadosAtualizados[0].data_resposta).toBeInstanceOf(Date);
      
      // O segundo não deve mudar
      expect(resultado.convidadosAtualizados[1].status).toBe(CONVIDADO_STATUS.ACEITO);
      expect(resultado.convidadosAtualizados[1].resposta_automatica).toBeUndefined();
    });

    test('deve retornar false para mudanças quando não há pendentes', () => {
      const convidados = [
        { email: 'test1@example.com', status: CONVIDADO_STATUS.ACEITO },
        { email: 'test2@example.com', status: CONVIDADO_STATUS.RECUSADO }
      ];

      const resultado = ConvidadoUtilsService.markExpiredAsAccepted(convidados);
      expect(resultado.houveMudancas).toBe(false);
    });
  });

  describe('validateEmailOperation', () => {
    const convidados = [
      { 
        email: 'test@example.com',
        status: CONVIDADO_STATUS.PENDENTE,
        data_convite: new Date()
      }
    ];

    test('deve validar operação válida', () => {
      const dataRecente = new Date();
      dataRecente.setHours(dataRecente.getHours() - 1);

      expect(() => {
        ConvidadoUtilsService.validateEmailOperation(convidados, 'test@example.com', dataRecente);
      }).not.toThrow();
    });

    test('deve rejeitar convite expirado', () => {
      const dataExpirada = new Date();
      dataExpirada.setHours(dataExpirada.getHours() - (TEMPO_CONFIG.EXPIRACAO_CONVITE_HORAS + 1));

      expect(() => {
        ConvidadoUtilsService.validateEmailOperation(convidados, 'test@example.com', dataExpirada);
      }).toThrow(ERROR_MESSAGES.CONVITE_EXPIRADO);
    });
  });

  describe('getEmailsByStatus', () => {
    const convidados = [
      { email: 'aceito@example.com', nome: 'Aceito', status: CONVIDADO_STATUS.ACEITO },
      { email: 'pendente@example.com', nome: 'Pendente', status: CONVIDADO_STATUS.PENDENTE },
      { email: 'recusado@example.com', nome: 'Recusado', status: CONVIDADO_STATUS.RECUSADO }
    ];

    test('deve retornar todos os emails quando status não especificado', () => {
      const emails = ConvidadoUtilsService.getEmailsByStatus(convidados);
      expect(emails).toHaveLength(3);
    });

    test('deve filtrar por status específico', () => {
      const aceitos = ConvidadoUtilsService.getEmailsByStatus(convidados, CONVIDADO_STATUS.ACEITO);
      expect(aceitos).toHaveLength(1);
      expect(aceitos[0].email).toBe('aceito@example.com');
    });
  });

  describe('removeDuplicateEmails', () => {
    test('deve remover emails duplicados', () => {
      const convidados = [
        { email: 'test@example.com', nome: 'Primeiro' },
        { email: 'TEST@EXAMPLE.COM', nome: 'Segundo (duplicado)' },
        { email: 'outro@example.com', nome: 'Outro' }
      ];

      const resultado = ConvidadoUtilsService.removeDuplicateEmails(convidados);
      
      expect(resultado).toHaveLength(2);
      expect(resultado[0].nome).toBe('Primeiro'); // Mantém o primeiro
      expect(resultado[1].nome).toBe('Outro');
    });
  });
});