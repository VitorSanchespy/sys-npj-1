/**
 * Testes unitários para AgendamentoStatusController
 * Testa todas as funcionalidades de gestão de status de agendamentos
 */

const AgendamentoStatusController = require('../../../../controllers/agendamento/AgendamentoStatusController');
const AgendamentoModel = require('../../../../models/agendamentoModel');
const UsuarioModel = require('../../../../models/usuarioModel');
const emailService = require('../../../../services/emailService');
const logService = require('../../../../services/logService');

const { 
  AGENDAMENTO_STATUS, 
  CONVIDADO_STATUS, 
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} = require('../../../../config/agendamento/constants');

// Mocks
jest.mock('../../../../models/agendamentoModel');
jest.mock('../../../../models/usuarioModel');
jest.mock('../../../../services/emailService', () => ({
  sendEmail: jest.fn()
}));
jest.mock('../../../../services/logService', () => ({
  logError: jest.fn(),
  logInfo: jest.fn()
}));
jest.mock('../../../../services/agendamento/AgendamentoEmailTemplateService', () => ({
  generateNotificacaoOrganizadorTemplate: jest.fn()
}));

describe('AgendamentoStatusController', () => {

  let mockTransaction;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Mock transaction
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn()
    };

    // Mock sequelize
    mockSequelize = {
      transaction: jest.fn().mockResolvedValue(mockTransaction)
    };

    // Mock request
    mockReq = {
      params: {},
      body: {},
      query: {},
      user: { id: 1 }
    };

    // Mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };

    // Clear mocks
    jest.clearAllMocks();
    
    // Reset service mocks
    const emailService = require('../../../../services/emailService');
    const logService = require('../../../../services/logService');
    const AgendamentoEmailTemplateService = require('../../../../services/agendamento/AgendamentoEmailTemplateService');
    
    emailService.sendEmail.mockReset();
    logService.logError.mockReset();
    logService.logInfo.mockReset();
    AgendamentoEmailTemplateService.generateNotificacaoOrganizadorTemplate.mockReset();

    // Mock AgendamentoModel.sequelize.transaction
    AgendamentoModel.sequelize = mockSequelize;
  });

  describe('alterarStatus', () => {
    test('deve alterar status com sucesso', async () => {
      const mockAgendamento = {
        id: 1,
        status: AGENDAMENTO_STATUS.EM_ANALISE,
        observacoes: 'Observações anteriores',
        usuario: { id: 1, nome: 'Usuário Teste', email: 'teste@test.com' },
        update: jest.fn().mockResolvedValue(true),
        dataValues: { id: 1, status: AGENDAMENTO_STATUS.EM_ANALISE }
      };

      mockReq.params = { agendamentoId: 1 };
      mockReq.body = { 
        novoStatus: AGENDAMENTO_STATUS.MARCADO,
        motivo: 'Aprovado para agendamento',
        notificarConvidados: false 
      };

      AgendamentoModel.findByPk.mockResolvedValue(mockAgendamento);
      
      jest.spyOn(AgendamentoStatusController, 'registrarHistoricoStatus')
        .mockResolvedValue();

      await AgendamentoStatusController.alterarStatus(mockReq, mockRes);

      expect(mockAgendamento.update).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: SUCCESS_MESSAGES.STATUS_ALTERADO_SUCESSO
        })
      );
    });

    test('deve rejeitar agendamento não encontrado', async () => {
      mockReq.params = { agendamentoId: 999 };
      mockReq.body = { novoStatus: AGENDAMENTO_STATUS.MARCADO };

      AgendamentoModel.findByPk.mockResolvedValue(null);

      await AgendamentoStatusController.alterarStatus(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test('deve rejeitar status inválido', async () => {
      mockReq.params = { agendamentoId: 1 };
      mockReq.body = { novoStatus: 'STATUS_INEXISTENTE' };

      await AgendamentoStatusController.alterarStatus(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('deve rejeitar transição inválida', async () => {
      const mockAgendamento = {
        id: 1,
        status: AGENDAMENTO_STATUS.FINALIZADO,
        usuario: { id: 1, nome: 'Usuário Teste' },
        dataValues: { id: 1, status: AGENDAMENTO_STATUS.FINALIZADO }
      };

      mockReq.params = { agendamentoId: 1 };
      mockReq.body = { novoStatus: AGENDAMENTO_STATUS.EM_ANALISE };

      AgendamentoModel.findByPk.mockResolvedValue(mockAgendamento);

      await AgendamentoStatusController.alterarStatus(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('deve exigir motivo para cancelamento', async () => {
      mockReq.params = { agendamentoId: 1 };
      mockReq.body = { novoStatus: AGENDAMENTO_STATUS.CANCELADO };

      await AgendamentoStatusController.alterarStatus(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errors: expect.arrayContaining(['Motivo é obrigatório para este status'])
        })
      );
    });

    test('deve tratar erro interno', async () => {
      mockReq.params = { agendamentoId: 1 };
      mockReq.body = { novoStatus: AGENDAMENTO_STATUS.MARCADO };

      AgendamentoModel.findByPk.mockRejectedValue(new Error('Erro de conexão'));

      await AgendamentoStatusController.alterarStatus(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('consultarHistorico', () => {
    test('deve retornar histórico com sucesso', async () => {
      const mockAgendamento = {
        id: 1,
        status: AGENDAMENTO_STATUS.MARCADO,
        observacoes: '[01/01/2024 10:00:00] Status: rascunho → em_analise (Enviado para análise)\n[01/01/2024 11:00:00] Status: em_analise → marcado por usuário 1'
      };

      mockReq.params = { agendamentoId: 1 };
      mockReq.query = { limite: 10, offset: 0 };

      AgendamentoModel.findByPk.mockResolvedValue(mockAgendamento);

      await AgendamentoStatusController.consultarHistorico(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            agendamentoId: 1,
            statusAtual: AGENDAMENTO_STATUS.MARCADO,
            historico: expect.any(Array)
          })
        })
      );
    });

    test('deve rejeitar agendamento não encontrado', async () => {
      mockReq.params = { agendamentoId: 999 };

      AgendamentoModel.findByPk.mockResolvedValue(null);

      await AgendamentoStatusController.consultarHistorico(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('consultarTransicoesDisponiveis', () => {
    test('deve retornar transições disponíveis', async () => {
      const mockAgendamento = {
        id: 1,
        status: AGENDAMENTO_STATUS.EM_ANALISE,
        data_inicio: new Date(Date.now() + 86400000), // Amanhã
        usuario: { id: 1, nome: 'Usuário Teste' }
      };

      mockReq.params = { agendamentoId: 1 };

      AgendamentoModel.findByPk.mockResolvedValue(mockAgendamento);

      await AgendamentoStatusController.consultarTransicoesDisponiveis(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            agendamentoId: 1,
            statusAtual: AGENDAMENTO_STATUS.EM_ANALISE,
            transicoesDisponiveis: expect.any(Array)
          })
        })
      );
    });

    test('deve rejeitar agendamento não encontrado', async () => {
      mockReq.params = { agendamentoId: 999 };

      AgendamentoModel.findByPk.mockResolvedValue(null);

      await AgendamentoStatusController.consultarTransicoesDisponiveis(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('atualizarStatusAutomatico', () => {
    test('deve atualizar status automaticamente', async () => {
      const mockAgendamento = {
        id: 1,
        status: AGENDAMENTO_STATUS.MARCADO,
        convidados: JSON.stringify([
          { email: 'test1@test.com', status: CONVIDADO_STATUS.ACEITO },
          { email: 'test2@test.com', status: CONVIDADO_STATUS.ACEITO }
        ]),
        update: jest.fn().mockResolvedValue(true),
        dataValues: {
          id: 1,
          status: AGENDAMENTO_STATUS.MARCADO,
          convidados: JSON.stringify([
            { email: 'test1@test.com', status: CONVIDADO_STATUS.ACEITO },
            { email: 'test2@test.com', status: CONVIDADO_STATUS.ACEITO }
          ])
        }
      };

      mockReq.params = { agendamentoId: 1 };

      AgendamentoModel.findByPk.mockResolvedValue(mockAgendamento);
      
      jest.spyOn(AgendamentoStatusController, 'registrarHistoricoStatus')
        .mockResolvedValue();

      // Mock do AgendamentoStatusService para retornar status diferente
      const AgendamentoStatusService = require('../../../../services/agendamento/AgendamentoStatusService');
      jest.spyOn(AgendamentoStatusService, 'updateAutomaticStatus')
        .mockReturnValue({
          statusAtualizado: AGENDAMENTO_STATUS.CONFIRMADO,
          motivo: 'Todos convidados aceitaram'
        });

      await AgendamentoStatusController.atualizarStatusAutomatico(mockReq, mockRes);

      expect(mockAgendamento.update).toHaveBeenCalledWith(
        { status: AGENDAMENTO_STATUS.CONFIRMADO },
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            alteracaoNecessaria: true
          })
        })
      );
    });

    test('deve informar quando não há alteração necessária', async () => {
      const mockAgendamento = {
        id: 1,
        status: AGENDAMENTO_STATUS.CONFIRMADO,
        dataValues: { id: 1, status: AGENDAMENTO_STATUS.CONFIRMADO }
      };

      mockReq.params = { agendamentoId: 1 };

      AgendamentoModel.findByPk.mockResolvedValue(mockAgendamento);

      // Mock para retornar o mesmo status
      const AgendamentoStatusService = require('../../../../services/agendamento/AgendamentoStatusService');
      jest.spyOn(AgendamentoStatusService, 'updateAutomaticStatus')
        .mockReturnValue({
          statusAtualizado: AGENDAMENTO_STATUS.CONFIRMADO
        });

      await AgendamentoStatusController.atualizarStatusAutomatico(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            alteracaoNecessaria: false
          })
        })
      );
    });
  });

  describe('Métodos auxiliares', () => {
    describe('validateStatusChange', () => {
      test('deve validar status válido', () => {
        const result = AgendamentoStatusController.validateStatusChange(
          AGENDAMENTO_STATUS.MARCADO
        );
        expect(result.valid).toBe(true);
      });

      test('deve rejeitar status inválido', () => {
        const result = AgendamentoStatusController.validateStatusChange('INVALIDO');
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Status inválido');
      });

      test('deve rejeitar status vazio', () => {
        const result = AgendamentoStatusController.validateStatusChange('');
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Novo status é obrigatório');
      });

      test('deve exigir motivo para cancelamento', () => {
        const result = AgendamentoStatusController.validateStatusChange(
          AGENDAMENTO_STATUS.CANCELADO
        );
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Motivo é obrigatório para este status');
      });

      test('deve aceitar cancelamento com motivo', () => {
        const result = AgendamentoStatusController.validateStatusChange(
          AGENDAMENTO_STATUS.CANCELADO,
          'Cliente cancelou'
        );
        expect(result.valid).toBe(true);
      });

      test('deve rejeitar motivo muito longo', () => {
        const motivoLongo = 'a'.repeat(501);
        const result = AgendamentoStatusController.validateStatusChange(
          AGENDAMENTO_STATUS.CANCELADO,
          motivoLongo
        );
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Motivo não pode exceder 500 caracteres');
      });
    });

    describe('validateStatusTransition', () => {
      test('deve permitir transição válida', () => {
        const result = AgendamentoStatusController.validateStatusTransition(
          AGENDAMENTO_STATUS.EM_ANALISE,
          AGENDAMENTO_STATUS.MARCADO,
          { data_agendamento: new Date(Date.now() + 86400000) }
        );
        expect(result.valid).toBe(true);
      });

      test('deve rejeitar transição inválida', () => {
        const result = AgendamentoStatusController.validateStatusTransition(
          AGENDAMENTO_STATUS.FINALIZADO,
          AGENDAMENTO_STATUS.EM_ANALISE,
          {}
        );
        expect(result.valid).toBe(false);
      });

      test('deve ter método validateStatusTransition funcional', () => {
        // Teste simples para garantir que o método existe e funciona
        expect(typeof AgendamentoStatusController.validateStatusTransition).toBe('function');
        
        const result = AgendamentoStatusController.validateStatusTransition(
          AGENDAMENTO_STATUS.EM_ANALISE,
          AGENDAMENTO_STATUS.MARCADO,
          {}
        );
        expect(result).toHaveProperty('valid');
      });

      test('deve usar validação temporal corretamente', () => {
        // Teste mais direto da lógica de data
        const agendamentoFuturo = { data_inicio: new Date(Date.now() + 86400000) };
        const result = AgendamentoStatusController.validateStatusTransition(
          AGENDAMENTO_STATUS.CONFIRMADO,
          AGENDAMENTO_STATUS.FINALIZADO,
          agendamentoFuturo
        );
        expect(result.valid).toBe(false);
      });
    });

    describe('calcularTransicoesDisponiveis', () => {
      test('deve retornar transições para status em análise', () => {
        const agendamento = {
          status: AGENDAMENTO_STATUS.EM_ANALISE,
          data_inicio: new Date(Date.now() + 86400000)
        };

        const transicoes = AgendamentoStatusController.calcularTransicoesDisponiveis(agendamento);
        
        expect(transicoes).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ status: AGENDAMENTO_STATUS.MARCADO }),
            expect.objectContaining({ status: AGENDAMENTO_STATUS.CANCELADO })
          ])
        );
      });

      test('deve retornar array vazio para status final', () => {
        const agendamento = {
          status: AGENDAMENTO_STATUS.FINALIZADO,
          data_inicio: new Date(Date.now() - 86400000)
        };

        const transicoes = AgendamentoStatusController.calcularTransicoesDisponiveis(agendamento);
        
        expect(transicoes).toHaveLength(0);
      });
    });

    describe('extrairHistoricoObservacoes', () => {
      test('deve extrair histórico das observações', () => {
        const observacoes = '[01/01/2024 10:00:00] Status: rascunho → em_analise (Enviado para análise) por usuário 1\n[01/01/2024 11:00:00] Status: em_analise → marcado';

        const historico = AgendamentoStatusController.extrairHistoricoObservacoes(observacoes);

        expect(historico).toHaveLength(2);
        expect(historico[0]).toEqual(
          expect.objectContaining({
            statusAnterior: 'em_analise',
            statusNovo: 'marcado'
          })
        );
        expect(historico[1]).toEqual(
          expect.objectContaining({
            statusAnterior: 'rascunho',
            statusNovo: 'em_analise',
            motivo: 'Enviado para análise',
            usuarioId: 1
          })
        );
      });

      test('deve retornar array vazio para observações nulas', () => {
        const historico = AgendamentoStatusController.extrairHistoricoObservacoes(null);
        expect(historico).toHaveLength(0);
      });
    });

    describe('statusRequerNotificacao', () => {
      test('deve identificar status que requerem notificação', () => {
        expect(AgendamentoStatusController.statusRequerNotificacao(AGENDAMENTO_STATUS.CONFIRMADO)).toBe(true);
        expect(AgendamentoStatusController.statusRequerNotificacao(AGENDAMENTO_STATUS.CANCELADO)).toBe(true);
        expect(AgendamentoStatusController.statusRequerNotificacao(AGENDAMENTO_STATUS.EM_ANALISE)).toBe(false);
      });
    });
  });
});