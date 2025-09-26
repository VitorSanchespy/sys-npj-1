/**
 * Testes unitários para AgendamentoStatusService
 */

const AgendamentoStatusService = require('../../../../services/agendamento/AgendamentoStatusService');
const { AGENDAMENTO_STATUS, CONVIDADO_STATUS } = require('../../../../config/agendamento/constants');

describe('AgendamentoStatusService', () => {

  describe('determineStatusFromConvidados', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 dias no futuro

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7); // 7 dias no passado

    test('deve retornar MARCADO para agendamento sem convidados', () => {
      const status = AgendamentoStatusService.determineStatusFromConvidados([], futureDate);
      expect(status).toBe(AGENDAMENTO_STATUS.MARCADO);
    });

    test('deve retornar MARCADO quando todos aceitaram (futuro)', () => {
      const convidados = [
        { email: 'test1@example.com', status: CONVIDADO_STATUS.ACEITO },
        { email: 'test2@example.com', status: CONVIDADO_STATUS.ACEITO }
      ];

      const status = AgendamentoStatusService.determineStatusFromConvidados(convidados, futureDate);
      expect(status).toBe(AGENDAMENTO_STATUS.MARCADO);
    });

    test('deve retornar CANCELADO quando todos recusaram (futuro)', () => {
      const convidados = [
        { email: 'test1@example.com', status: CONVIDADO_STATUS.RECUSADO },
        { email: 'test2@example.com', status: CONVIDADO_STATUS.RECUSADO }
      ];

      const status = AgendamentoStatusService.determineStatusFromConvidados(convidados, futureDate);
      expect(status).toBe(AGENDAMENTO_STATUS.CANCELADO);
    });

    test('deve retornar MARCADO para situação mista (futuro)', () => {
      const convidados = [
        { email: 'test1@example.com', status: CONVIDADO_STATUS.ACEITO },
        { email: 'test2@example.com', status: CONVIDADO_STATUS.RECUSADO }
      ];

      const status = AgendamentoStatusService.determineStatusFromConvidados(convidados, futureDate);
      expect(status).toBe(AGENDAMENTO_STATUS.MARCADO);
    });

    test('deve retornar PENDENTE quando há pendentes', () => {
      const convidados = [
        { email: 'test1@example.com', status: CONVIDADO_STATUS.ACEITO },
        { email: 'test2@example.com', status: CONVIDADO_STATUS.PENDENTE }
      ];

      const status = AgendamentoStatusService.determineStatusFromConvidados(convidados, futureDate);
      expect(status).toBe(AGENDAMENTO_STATUS.PENDENTE);
    });

    test('deve retornar FINALIZADO para agendamentos passados (comportamento padrão)', () => {
      const convidados = [
        { email: 'test1@example.com', status: CONVIDADO_STATUS.PENDENTE }
      ];

      const status = AgendamentoStatusService.determineStatusFromConvidados(convidados, pastDate);
      expect(status).toBe(AGENDAMENTO_STATUS.FINALIZADO);
    });

    test('deve retornar FINALIZADO para agendamentos passados com todos aceitos', () => {
      const convidados = [
        { email: 'test1@example.com', status: CONVIDADO_STATUS.ACEITO },
        { email: 'test2@example.com', status: CONVIDADO_STATUS.ACEITO }
      ];

      const status = AgendamentoStatusService.determineStatusFromConvidados(convidados, pastDate);
      expect(status).toBe(AGENDAMENTO_STATUS.FINALIZADO);
    });
  });

  describe('determineStatusAfterExpiration', () => {
    test('deve retornar MARCADO quando ninguém respondeu', () => {
      const stats = { total: 3, aceitos: 0, recusados: 0, pendentes: 3 };
      const status = AgendamentoStatusService.determineStatusAfterExpiration(stats);
      expect(status).toBe(AGENDAMENTO_STATUS.MARCADO);
    });

    test('deve retornar MARCADO quando só há aceitos', () => {
      const stats = { total: 2, aceitos: 2, recusados: 0, pendentes: 0 };
      const status = AgendamentoStatusService.determineStatusAfterExpiration(stats);
      expect(status).toBe(AGENDAMENTO_STATUS.MARCADO);
    });

    test('deve retornar MARCADO para situação mista', () => {
      const stats = { total: 3, aceitos: 1, recusados: 1, pendentes: 1 };
      const status = AgendamentoStatusService.determineStatusAfterExpiration(stats);
      expect(status).toBe(AGENDAMENTO_STATUS.MARCADO);
    });

    test('deve retornar CANCELADO quando todos recusaram', () => {
      const stats = { total: 2, aceitos: 0, recusados: 2, pendentes: 0 };
      const status = AgendamentoStatusService.determineStatusAfterExpiration(stats);
      expect(status).toBe(AGENDAMENTO_STATUS.CANCELADO);
    });
  });

  describe('updateAutomaticStatus', () => {
    test('deve detectar quando não há mudança de status', () => {
      const agendamento = {
        id: 1,
        status: AGENDAMENTO_STATUS.MARCADO,
        data_hora: new Date(Date.now() + 86400000), // Amanhã
        convidados: '[]',
        data_convite: null
      };

      const resultado = AgendamentoStatusService.updateAutomaticStatus(agendamento);
      
      expect(resultado.houveMudanca).toBe(false);
      expect(resultado.statusAtualizado).toBe(AGENDAMENTO_STATUS.MARCADO);
      expect(resultado.motivoMudanca).toBeNull();
    });

    test('deve detectar mudança de status com motivo', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const agendamento = {
        id: 1,
        status: AGENDAMENTO_STATUS.PENDENTE,
        data_hora: futureDate,
        convidados: JSON.stringify([
          { email: 'test1@example.com', status: CONVIDADO_STATUS.ACEITO },
          { email: 'test2@example.com', status: CONVIDADO_STATUS.ACEITO }
        ]),
        data_convite: new Date()
      };

      const resultado = AgendamentoStatusService.updateAutomaticStatus(agendamento);
      
      expect(resultado.houveMudanca).toBe(true);
      expect(resultado.statusAtualizado).toBe(AGENDAMENTO_STATUS.MARCADO);
      expect(resultado.motivoMudanca).toContain('Todos os convidados aceitaram');
    });
  });

  describe('getStatusChangeReason', () => {
    test('deve retornar motivo específico para transições conhecidas', () => {
      const convidados = [
        { email: 'test@example.com', status: CONVIDADO_STATUS.ACEITO }
      ];

      const motivo = AgendamentoStatusService.getStatusChangeReason(
        AGENDAMENTO_STATUS.PENDENTE,
        AGENDAMENTO_STATUS.MARCADO,
        convidados
      );

      expect(motivo).toBe('Todos os convidados aceitaram o convite');
    });

    test('deve retornar motivo genérico para transições não mapeadas', () => {
      const convidados = [];

      const motivo = AgendamentoStatusService.getStatusChangeReason(
        'STATUS_CUSTOM',
        'OUTRO_STATUS_CUSTOM',
        convidados
      );

      expect(motivo).toBe('Atualização automática de status');
    });
  });

  describe('canChangeStatusManually', () => {
    test('deve impedir alteração de status finais', () => {
      expect(AgendamentoStatusService.canChangeStatusManually(
        AGENDAMENTO_STATUS.FINALIZADO,
        AGENDAMENTO_STATUS.MARCADO
      )).toBe(false);

      expect(AgendamentoStatusService.canChangeStatusManually(
        AGENDAMENTO_STATUS.CANCELADO,
        AGENDAMENTO_STATUS.MARCADO
      )).toBe(false);
    });

    test('deve impedir alteração para status automáticos', () => {
      expect(AgendamentoStatusService.canChangeStatusManually(
        AGENDAMENTO_STATUS.EM_ANALISE,
        AGENDAMENTO_STATUS.ENVIANDO_CONVITES
      )).toBe(false);

      expect(AgendamentoStatusService.canChangeStatusManually(
        AGENDAMENTO_STATUS.EM_ANALISE,
        AGENDAMENTO_STATUS.PENDENTE
      )).toBe(false);
    });

    test('deve permitir alterações válidas', () => {
      expect(AgendamentoStatusService.canChangeStatusManually(
        AGENDAMENTO_STATUS.EM_ANALISE,
        AGENDAMENTO_STATUS.MARCADO
      )).toBe(true);
    });
  });

  describe('processStatusBatch', () => {
    test('deve processar lista vazia corretamente', () => {
      const resultado = AgendamentoStatusService.processStatusBatch([]);
      
      expect(resultado.processados).toBe(0);
      expect(resultado.atualizados).toBe(0);
      expect(resultado.erros).toHaveLength(0);
      expect(resultado.detalhes).toHaveLength(0);
    });

    test('deve processar múltiplos agendamentos', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const agendamentos = [
        {
          id: 1,
          status: AGENDAMENTO_STATUS.MARCADO,
          data_hora: futureDate,
          convidados: '[]',
          data_convite: null
        },
        {
          id: 2,
          status: AGENDAMENTO_STATUS.PENDENTE,
          data_hora: futureDate,
          convidados: JSON.stringify([
            { email: 'test@example.com', status: CONVIDADO_STATUS.ACEITO }
          ]),
          data_convite: new Date()
        }
      ];

      const resultado = AgendamentoStatusService.processStatusBatch(agendamentos);
      
      expect(resultado.processados).toBe(2);
      expect(resultado.atualizados).toBe(1); // Apenas o segundo muda
      expect(resultado.erros).toHaveLength(0);
    });
  });

  describe('needsStatusUpdate', () => {
    test('deve retornar false quando status está correto', () => {
      const agendamento = {
        id: 1,
        status: AGENDAMENTO_STATUS.MARCADO,
        data_hora: new Date(Date.now() + 86400000),
        convidados: '[]',
        data_convite: null
      };

      expect(AgendamentoStatusService.needsStatusUpdate(agendamento)).toBe(false);
    });

    test('deve retornar true quando status precisa ser atualizado', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const agendamento = {
        id: 1,
        status: AGENDAMENTO_STATUS.PENDENTE,
        data_hora: futureDate,
        convidados: JSON.stringify([
          { email: 'test@example.com', status: CONVIDADO_STATUS.ACEITO }
        ]),
        data_convite: new Date()
      };

      expect(AgendamentoStatusService.needsStatusUpdate(agendamento)).toBe(true);
    });
  });

  describe('getRecommendedActions', () => {
    test('deve retornar ações para PENDENTE', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const agendamento = {
        status: AGENDAMENTO_STATUS.PENDENTE,
        data_hora: futureDate,
        convidados: JSON.stringify([
          { email: 'test@example.com', status: CONVIDADO_STATUS.PENDENTE }
        ])
      };

      const acoes = AgendamentoStatusService.getRecommendedActions(agendamento);
      expect(acoes).toContain('Enviar lembrete para convidados pendentes');
    });

    test('deve retornar ações para ENVIANDO_CONVITES', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // Amanhã

      const agendamento = {
        status: AGENDAMENTO_STATUS.ENVIANDO_CONVITES,
        data_hora: futureDate,
        convidados: JSON.stringify([
          { email: 'test1@example.com', status: CONVIDADO_STATUS.ACEITO },
          { email: 'test2@example.com', status: CONVIDADO_STATUS.RECUSADO }
        ])
      };

      const acoes = AgendamentoStatusService.getRecommendedActions(agendamento);
      expect(acoes.length).toBeGreaterThan(0);
      expect(acoes.some(acao => acao.includes('participação parcial'))).toBe(true);
    });

    test('deve sugerir ações baseadas no tempo restante', () => {
      const soonDate = new Date();
      soonDate.setHours(soonDate.getHours() + 1); // Em 1 hora

      const agendamento = {
        status: AGENDAMENTO_STATUS.MARCADO,
        data_hora: soonDate,
        convidados: '[]'
      };

      const acoes = AgendamentoStatusService.getRecommendedActions(agendamento);
      expect(acoes).toContain('Preparar materiais para o agendamento');
    });
  });

  describe('calculatePriorityScore', () => {
    test('deve calcular score base corretamente', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const agendamento = {
        status: AGENDAMENTO_STATUS.MARCADO,
        data_hora: futureDate,
        convidados: '[]'
      };

      const score = AgendamentoStatusService.calculatePriorityScore(agendamento);
      expect(score).toBe(60); // Score para MARCADO
    });

    test('deve aumentar score para status urgentes', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const agendamento = {
        status: AGENDAMENTO_STATUS.PENDENTE,
        data_hora: futureDate,
        convidados: '[]'
      };

      const score = AgendamentoStatusService.calculatePriorityScore(agendamento);
      expect(score).toBe(80); // Score alto para PENDENTE
    });

    test('deve aumentar score por urgência temporal', () => {
      const soonDate = new Date();
      soonDate.setHours(soonDate.getHours() + 1); // Em 1 hora

      const agendamento = {
        status: AGENDAMENTO_STATUS.MARCADO,
        data_hora: soonDate,
        convidados: '[]'
      };

      const score = AgendamentoStatusService.calculatePriorityScore(agendamento);
      expect(score).toBe(80); // 60 base + 20 urgência
    });

    test('deve aumentar score por muitos convidados', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const muitosConvidados = Array.from({ length: 6 }, (_, i) => ({
        email: `test${i}@example.com`,
        status: CONVIDADO_STATUS.PENDENTE
      }));

      const agendamento = {
        status: AGENDAMENTO_STATUS.MARCADO,
        data_hora: futureDate,
        convidados: JSON.stringify(muitosConvidados)
      };

      const score = AgendamentoStatusService.calculatePriorityScore(agendamento);
      expect(score).toBe(70); // 60 base + 10 por muitos convidados
    });

    test('deve limitar score entre 0 e 100', () => {
      const urgentDate = new Date();
      urgentDate.setMinutes(urgentDate.getMinutes() + 30); // Em 30 minutos

      const agendamento = {
        status: AGENDAMENTO_STATUS.PENDENTE, // 80 base
        data_hora: urgentDate, // +20 urgência
        convidados: JSON.stringify(Array.from({ length: 10 }, (_, i) => ({
          email: `test${i}@example.com`
        }))) // +10 muitos convidados
      };

      const score = AgendamentoStatusService.calculatePriorityScore(agendamento);
      expect(score).toBeLessThanOrEqual(100);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });
});