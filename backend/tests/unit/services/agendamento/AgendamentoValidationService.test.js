/**
 * Testes unitários para AgendamentoValidationService
 */

const AgendamentoValidationService = require('../../../../services/agendamento/AgendamentoValidationService');
const { AGENDAMENTO_LIMITS, ERROR_MESSAGES } = require('../../../../config/agendamento/constants');

describe('AgendamentoValidationService', () => {

  describe('validateBasicData', () => {
    test('deve validar dados básicos válidos', () => {
      const dataFutura = new Date();
      dataFutura.setHours(dataFutura.getHours() + 2);
      const dataFim = new Date(dataFutura);
      dataFim.setHours(dataFim.getHours() + 1);

      const dadosValidos = {
        titulo: 'Reunião de teste',
        data_inicio: dataFutura.toISOString(),
        data_fim: dataFim.toISOString(),
        tipo: 'reuniao',
        email_lembrete: 'test@example.com'
      };

      const resultado = AgendamentoValidationService.validateBasicData(dadosValidos);
      expect(resultado.isValid).toBe(true);
      expect(resultado.errors).toHaveLength(0);
    });

    test('deve rejeitar título muito curto', () => {
      const dados = {
        titulo: 'AB', // Menor que MIN_TITULO_LENGTH (3)
        data_inicio: new Date(Date.now() + 3600000).toISOString(),
        data_fim: new Date(Date.now() + 7200000).toISOString()
      };

      const resultado = AgendamentoValidationService.validateBasicData(dados);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors).toContain(`Título deve ter pelo menos ${AGENDAMENTO_LIMITS.MIN_TITULO_LENGTH} caracteres`);
    });

    test('deve rejeitar título muito longo', () => {
      const dados = {
        titulo: 'A'.repeat(AGENDAMENTO_LIMITS.MAX_TITULO_LENGTH + 1),
        data_inicio: new Date(Date.now() + 3600000).toISOString(),
        data_fim: new Date(Date.now() + 7200000).toISOString()
      };

      const resultado = AgendamentoValidationService.validateBasicData(dados);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors).toContain(`Título deve ter no máximo ${AGENDAMENTO_LIMITS.MAX_TITULO_LENGTH} caracteres`);
    });

    test('deve rejeitar data de início no passado', () => {
      const dataPassada = new Date();
      dataPassada.setHours(dataPassada.getHours() - 1);

      const dados = {
        titulo: 'Teste',
        data_inicio: dataPassada.toISOString(),
        data_fim: new Date(Date.now() + 3600000).toISOString()
      };

      const resultado = AgendamentoValidationService.validateBasicData(dados);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors).toContain('Data de início não pode ser no passado');
    });

    test('deve rejeitar data de fim anterior à data de início', () => {
      const dataInicio = new Date(Date.now() + 3600000);
      const dataFim = new Date(Date.now() + 1800000); // 30 min antes

      const dados = {
        titulo: 'Teste',
        data_inicio: dataInicio.toISOString(),
        data_fim: dataFim.toISOString()
      };

      const resultado = AgendamentoValidationService.validateBasicData(dados);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors).toContain('Data de fim deve ser posterior à data de início');
    });

    test('deve rejeitar email inválido', () => {
      const dados = {
        titulo: 'Teste',
        data_inicio: new Date(Date.now() + 3600000).toISOString(),
        data_fim: new Date(Date.now() + 7200000).toISOString(),
        email_lembrete: 'email-invalido'
      };

      const resultado = AgendamentoValidationService.validateBasicData(dados);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors.some(error => error.includes(ERROR_MESSAGES.EMAIL_INVALIDO))).toBe(true);
    });

    test('deve validar campos obrigatórios ausentes', () => {
      const dados = {};

      const resultado = AgendamentoValidationService.validateBasicData(dados);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors).toContain('Título é obrigatório');
      expect(resultado.errors).toContain('Data de início é obrigatória');
      expect(resultado.errors).toContain('Data de fim é obrigatória');
    });
  });

  describe('validateConvidados', () => {
    test('deve validar lista vazia de convidados', () => {
      const resultado = AgendamentoValidationService.validateConvidados([]);
      expect(resultado.isValid).toBe(true);
      expect(resultado.totalConvidados).toBe(0);
      expect(resultado.emailsUnicos).toBe(0);
    });

    test('deve validar convidados válidos', () => {
      const convidados = [
        { email: 'test1@example.com', nome: 'Teste 1' },
        { email: 'test2@example.com', nome: 'Teste 2' }
      ];

      const resultado = AgendamentoValidationService.validateConvidados(convidados);
      expect(resultado.isValid).toBe(true);
      expect(resultado.totalConvidados).toBe(2);
      expect(resultado.emailsUnicos).toBe(2);
    });

    test('deve rejeitar mais que o limite máximo de convidados', () => {
      const convidados = [];
      for (let i = 0; i < AGENDAMENTO_LIMITS.MAX_CONVIDADOS + 1; i++) {
        convidados.push({ email: `test${i}@example.com`, nome: `Teste ${i}` });
      }

      const resultado = AgendamentoValidationService.validateConvidados(convidados);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors.some(error => error.includes(ERROR_MESSAGES.LIMITE_CONVIDADOS_EXCEDIDO))).toBe(true);
    });

    test('deve rejeitar emails duplicados', () => {
      const convidados = [
        { email: 'test@example.com', nome: 'Teste 1' },
        { email: 'test@example.com', nome: 'Teste 2' } // Email duplicado
      ];

      const resultado = AgendamentoValidationService.validateConvidados(convidados);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors.some(error => error.includes(ERROR_MESSAGES.EMAIL_DUPLICADO))).toBe(true);
    });

    test('deve rejeitar emails inválidos', () => {
      const convidados = [
        { email: 'email-invalido', nome: 'Teste' }
      ];

      const resultado = AgendamentoValidationService.validateConvidados(convidados);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors.some(error => error.includes(ERROR_MESSAGES.EMAIL_INVALIDO))).toBe(true);
    });

    test('deve rejeitar entrada que não é array', () => {
      const resultado = AgendamentoValidationService.validateConvidados('não é array');
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors).toContain('Convidados deve ser um array');
    });

    test('deve validar nome muito longo', () => {
      const convidados = [
        { 
          email: 'test@example.com', 
          nome: 'A'.repeat(AGENDAMENTO_LIMITS.MAX_NOME_LENGTH + 1) 
        }
      ];

      const resultado = AgendamentoValidationService.validateConvidados(convidados);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors.some(error => 
        error.includes(`nome deve ter no máximo ${AGENDAMENTO_LIMITS.MAX_NOME_LENGTH} caracteres`)
      )).toBe(true);
    });
  });

  describe('validateEmail', () => {
    test('deve validar emails corretos', () => {
      const emailsValidos = [
        'test@example.com',
        'user.name@domain.co.uk',
        'usuario@teste.com.br'
      ];

      emailsValidos.forEach(email => {
        expect(AgendamentoValidationService.validateEmail(email)).toBe(true);
      });
    });

    test('deve rejeitar emails inválidos', () => {
      const emailsInvalidos = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@.com',
        '',
        null,
        undefined
      ];

      emailsInvalidos.forEach(email => {
        expect(AgendamentoValidationService.validateEmail(email)).toBe(false);
      });
    });
  });

  describe('sanitizeData', () => {
    test('deve sanitizar strings removendo espaços', () => {
      const dados = {
        titulo: '  Título com espaços  ',
        email_lembrete: '  TEST@EXAMPLE.COM  ',
        convidados: [
          { email: '  USER1@TEST.COM  ', nome: '  Nome 1  ' },
          { email: 'USER2@test.com', nome: 'Nome 2' }
        ]
      };

      const resultado = AgendamentoValidationService.sanitizeData(dados);
      
      expect(resultado.titulo).toBe('Título com espaços');
      expect(resultado.email_lembrete).toBe('test@example.com');
      expect(resultado.convidados[0].email).toBe('user1@test.com');
      expect(resultado.convidados[0].nome).toBe('Nome 1');
      expect(resultado.convidados[1].email).toBe('user2@test.com');
    });

    test('deve manter dados originais inalterados', () => {
      const dadosOriginais = {
        titulo: '  Teste  ',
        descricao: 'Descrição'
      };

      const resultado = AgendamentoValidationService.sanitizeData(dadosOriginais);
      
      // Dados originais não devem ser modificados
      expect(dadosOriginais.titulo).toBe('  Teste  ');
      // Resultado deve estar sanitizado
      expect(resultado.titulo).toBe('Teste');
    });
  });

  describe('validateStatus e validateConvidadoStatus', () => {
    test('deve validar status de agendamento válidos', () => {
      expect(AgendamentoValidationService.validateStatus('pendente')).toBe(true);
      expect(AgendamentoValidationService.validateStatus('marcado')).toBe(true);
      expect(AgendamentoValidationService.validateStatus('cancelado')).toBe(true);
    });

    test('deve rejeitar status de agendamento inválidos', () => {
      expect(AgendamentoValidationService.validateStatus('status_inexistente')).toBe(false);
      expect(AgendamentoValidationService.validateStatus('')).toBe(false);
    });

    test('deve validar status de convidado válidos', () => {
      expect(AgendamentoValidationService.validateConvidadoStatus('pendente')).toBe(true);
      expect(AgendamentoValidationService.validateConvidadoStatus('aceito')).toBe(true);
      expect(AgendamentoValidationService.validateConvidadoStatus('recusado')).toBe(true);
    });
  });
});