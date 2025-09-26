/**
 * Testes unitários para AgendamentoConviteController
 */

const AgendamentoConviteController = require('../../../../controllers/agendamento/AgendamentoConviteController');
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
  generateConviteTemplate: jest.fn(),
  generateConfirmacaoTemplate: jest.fn(),
  generateNotificacaoOrganizadorTemplate: jest.fn()
}));

describe('AgendamentoConviteController', () => {

  let mockTransaction;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Mock transaction
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn()
    };

    AgendamentoModel.sequelize = {
      transaction: jest.fn().mockResolvedValue(mockTransaction)
    };

    // Mock request
    mockReq = {
      params: {},
      body: {},
      user: { id: 1 }
    };

    // Mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
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
    AgendamentoEmailTemplateService.generateConviteTemplate.mockReset();
  });

  describe('enviarConvites', () => {
    const mockAgendamento = {
      id: 1,
      titulo: 'Reunião Teste',
      status: AGENDAMENTO_STATUS.EM_ANALISE,
      data_hora: new Date(Date.now() + 86400000), // Amanhã
      convidados: JSON.stringify([
        { email: 'test1@example.com', nome: 'Teste 1', status: CONVIDADO_STATUS.PENDENTE },
        { email: 'test2@example.com', nome: 'Teste 2', status: CONVIDADO_STATUS.PENDENTE }
      ]),
      usuario: { id: 1, nome: 'Organizador', email: 'org@example.com' },
      update: jest.fn().mockResolvedValue(true)
    };

    test('deve enviar convites com sucesso', async () => {
      mockReq.params = { agendamentoId: '1' };

      AgendamentoModel.findOne.mockResolvedValue(mockAgendamento);
      jest.spyOn(AgendamentoConviteController, 'processarEnvioEmails')
        .mockResolvedValue({ enviados: 2, falhas: 0 });

      await AgendamentoConviteController.enviarConvites(mockReq, mockRes);

      expect(mockAgendamento.update).toHaveBeenCalledWith({
        status: AGENDAMENTO_STATUS.ENVIANDO_CONVITES,
        data_convite: expect.any(Date)
      }, { transaction: mockTransaction });

      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: SUCCESS_MESSAGES.CONVITES_ENVIADOS,
        data: {
          agendamentoId: 1,
          totalConvidados: 2,
          status: AGENDAMENTO_STATUS.ENVIANDO_CONVITES
        }
      });
    });

    test('deve rejeitar agendamento não encontrado', async () => {
      mockReq.params = { agendamentoId: '999' };
      AgendamentoModel.findOne.mockResolvedValue(null);

      await AgendamentoConviteController.enviarConvites(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: ERROR_MESSAGES.AGENDAMENTO_NAO_ENCONTRADO
      });
    });

    test('deve rejeitar agendamento sem convidados', async () => {
      const agendamentoSemConvidados = {
        ...mockAgendamento,
        convidados: JSON.stringify([])
      };

      mockReq.params = { agendamentoId: '1' };
      AgendamentoModel.findOne.mockResolvedValue(agendamentoSemConvidados);

      await AgendamentoConviteController.enviarConvites(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: ERROR_MESSAGES.NENHUM_CONVIDADO_ENCONTRADO
      });
    });

    test('deve rejeitar agendamento que já passou', async () => {
      const agendamentoPassado = {
        ...mockAgendamento,
        data_hora: new Date(Date.now() - 86400000) // Ontem
      };

      mockReq.params = { agendamentoId: '1' };
      AgendamentoModel.findOne.mockResolvedValue(agendamentoPassado);

      await AgendamentoConviteController.enviarConvites(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('deve tratar erro interno', async () => {
      mockReq.params = { agendamentoId: '1' };
      AgendamentoModel.findOne.mockRejectedValue(new Error('Database error'));

      await AgendamentoConviteController.enviarConvites(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(logService.logError).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: ERROR_MESSAGES.ERRO_INTERNO_SERVIDOR
      });
    });
  });

  describe('responderConvite', () => {
    const mockAgendamento = {
      id: 1,
      titulo: 'Reunião Teste',
      data_convite: new Date(Date.now() - 3600000), // 1 hora atrás
      convidados: JSON.stringify([
        { email: 'test@example.com', nome: 'Teste', status: CONVIDADO_STATUS.PENDENTE, data_convite: new Date() }
      ]),
      usuario: { id: 1, nome: 'Organizador', email: 'org@example.com' },
      dataValues: { id: 1, status: AGENDAMENTO_STATUS.PENDENTE },
      update: jest.fn().mockResolvedValue(true)
    };

    test('deve aceitar convite com sucesso', async () => {
      mockReq.params = { agendamentoId: '1', email: 'test@example.com', resposta: 'aceito' };
      mockReq.body = {};

      AgendamentoModel.findByPk.mockResolvedValue(mockAgendamento);
      jest.spyOn(AgendamentoConviteController, 'enviarConfirmacaoResposta')
        .mockResolvedValue();
      jest.spyOn(AgendamentoConviteController, 'notificarOrganizadorResposta')
        .mockResolvedValue();

      await AgendamentoConviteController.responderConvite(mockReq, mockRes);

      expect(mockAgendamento.update).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: SUCCESS_MESSAGES.CONVITE_ACEITO
        })
      );
    });

    test('deve recusar convite com justificativa', async () => {
      mockReq.params = { agendamentoId: '1', email: 'test@example.com', resposta: 'recusado' };
      mockReq.body = { justificativa: 'Conflito de horário' };

      AgendamentoModel.findByPk.mockResolvedValue(mockAgendamento);
      jest.spyOn(AgendamentoConviteController, 'enviarConfirmacaoResposta')
        .mockResolvedValue();
      jest.spyOn(AgendamentoConviteController, 'notificarOrganizadorResposta')
        .mockResolvedValue();

      await AgendamentoConviteController.responderConvite(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: SUCCESS_MESSAGES.CONVITE_RECUSADO
        })
      );
    });

    test('deve rejeitar resposta inválida', async () => {
      mockReq.params = { agendamentoId: 'invalid', email: 'invalid-email', resposta: 'invalid' };

      await AgendamentoConviteController.responderConvite(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errors: expect.any(Array)
        })
      );
    });

    test('deve rejeitar agendamento não encontrado', async () => {
      mockReq.params = { agendamentoId: '999', email: 'test@example.com', resposta: 'aceito' };
      AgendamentoModel.findByPk.mockResolvedValue(null);

      await AgendamentoConviteController.responderConvite(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getStatusConvites', () => {
    const mockAgendamento = {
      id: 1,
      titulo: 'Reunião Teste',
      status: AGENDAMENTO_STATUS.PENDENTE,
      data_convite: new Date(),
      data_hora: new Date(Date.now() + 86400000),
      convidados: JSON.stringify([
        { email: 'test1@example.com', nome: 'Teste 1', status: CONVIDADO_STATUS.ACEITO },
        { email: 'test2@example.com', nome: 'Teste 2', status: CONVIDADO_STATUS.PENDENTE }
      ])
    };

    test('deve retornar status dos convites', async () => {
      mockReq.params = { agendamentoId: '1' };
      AgendamentoModel.findOne.mockResolvedValue(mockAgendamento);

      await AgendamentoConviteController.getStatusConvites(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          agendamento: expect.objectContaining({
            id: 1,
            titulo: 'Reunião Teste',
            status: AGENDAMENTO_STATUS.PENDENTE,
            prioridade: expect.any(Number)
          }),
          estatisticas: expect.objectContaining({
            total: 2,
            aceitos: 1,
            pendentes: 1
          }),
          convitesExpiraram: expect.any(Boolean),
          acoesRecomendadas: expect.any(Array),
          convidados: expect.arrayContaining([
            expect.objectContaining({
              email: 'test1@example.com',
              status: CONVIDADO_STATUS.ACEITO
            })
          ])
        })
      });
    });

    test('deve rejeitar agendamento não encontrado', async () => {
      mockReq.params = { agendamentoId: '999' };
      AgendamentoModel.findOne.mockResolvedValue(null);

      await AgendamentoConviteController.getStatusConvites(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: ERROR_MESSAGES.AGENDAMENTO_NAO_ENCONTRADO
      });
    });
  });

  describe('reenviarConvites', () => {
    const mockAgendamento = {
      id: 1,
      titulo: 'Reunião Teste',
      data_convite: new Date(Date.now() - 3600000), // 1 hora atrás
      convidados: JSON.stringify([
        { email: 'test1@example.com', nome: 'Teste 1', status: CONVIDADO_STATUS.PENDENTE },
        { email: 'test2@example.com', nome: 'Teste 2', status: CONVIDADO_STATUS.ACEITO }
      ]),
      usuario: { id: 1, nome: 'Organizador', email: 'org@example.com' }
    };

    test('deve reenviar convites para pendentes', async () => {
      mockReq.params = { agendamentoId: '1' };
      mockReq.body = {};

      AgendamentoModel.findOne.mockResolvedValue(mockAgendamento);
      jest.spyOn(AgendamentoConviteController, 'processarReenvioEmails')
        .mockResolvedValue({ enviados: 1, falhas: 0 });

      await AgendamentoConviteController.reenviarConvites(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: SUCCESS_MESSAGES.CONVITES_REENVIADOS,
        data: {
          agendamentoId: 1,
          totalReenviados: 1,
          falhas: 0
        }
      });
    });

    test('deve reenviar para emails específicos', async () => {
      mockReq.params = { agendamentoId: '1' };
      mockReq.body = { emails: ['test1@example.com'] };

      AgendamentoModel.findOne.mockResolvedValue(mockAgendamento);
      jest.spyOn(AgendamentoConviteController, 'processarReenvioEmails')
        .mockResolvedValue({ enviados: 1, falhas: 0 });

      await AgendamentoConviteController.reenviarConvites(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: SUCCESS_MESSAGES.CONVITES_REENVIADOS
        })
      );
    });

    test('deve rejeitar quando não há pendentes', async () => {
      const agendamentoSemPendentes = {
        ...mockAgendamento,
        convidados: JSON.stringify([
          { email: 'test1@example.com', nome: 'Teste 1', status: CONVIDADO_STATUS.ACEITO }
        ])
      };

      mockReq.params = { agendamentoId: '1' };
      mockReq.body = {};
      AgendamentoModel.findOne.mockResolvedValue(agendamentoSemPendentes);

      await AgendamentoConviteController.reenviarConvites(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: ERROR_MESSAGES.NENHUM_CONVIDADO_PENDENTE
      });
    });
  });

  describe('Métodos auxiliares', () => {
    describe('validateConvitesSending', () => {
      test('deve validar agendamento válido', () => {
        const agendamento = {
          data_hora: new Date(Date.now() + 86400000), // Amanhã
          status: AGENDAMENTO_STATUS.EM_ANALISE
        };

        const result = AgendamentoConviteController.validateConvitesSending(agendamento);
        expect(result.valid).toBe(true);
      });

      test('deve rejeitar agendamento que já passou', () => {
        const agendamento = {
          data_hora: new Date(Date.now() - 86400000), // Ontem
          status: AGENDAMENTO_STATUS.EM_ANALISE
        };

        const result = AgendamentoConviteController.validateConvitesSending(agendamento);
        expect(result.valid).toBe(false);
        expect(result.message).toBe(ERROR_MESSAGES.AGENDAMENTO_JA_PASSOU);
      });

      test('deve rejeitar status não permitido', () => {
        const agendamento = {
          data_hora: new Date(Date.now() + 86400000),
          status: AGENDAMENTO_STATUS.FINALIZADO
        };

        const result = AgendamentoConviteController.validateConvitesSending(agendamento);
        expect(result.valid).toBe(false);
        expect(result.message).toBe(ERROR_MESSAGES.STATUS_NAO_PERMITE_ENVIO_CONVITES);
      });
    });

    describe('gerarLinkResposta', () => {
      test('deve gerar link correto', () => {
        const originalEnv = process.env.FRONTEND_URL;
        process.env.FRONTEND_URL = 'https://sistema.com';

        const link = AgendamentoConviteController.gerarLinkResposta(123, 'test@example.com');
        
        expect(link).toBe('https://sistema.com/convite/123/test%40example.com');
        
        process.env.FRONTEND_URL = originalEnv;
      });

      test('deve usar URL padrão quando não configurada', () => {
        const originalEnv = process.env.FRONTEND_URL;
        delete process.env.FRONTEND_URL;

        const link = AgendamentoConviteController.gerarLinkResposta(123, 'test@example.com');
        
        expect(link).toContain('localhost:3000');
        
        process.env.FRONTEND_URL = originalEnv;
      });
    });

    describe('processarEnvioEmails', () => {
      test('deve existir método processarEnvioEmails', () => {
        expect(typeof AgendamentoConviteController.processarEnvioEmails).toBe('function');
      });

      test('deve existir método atualizarStatusAposEnvio', () => {
        expect(typeof AgendamentoConviteController.atualizarStatusAposEnvio).toBe('function');
      });
    });
  });
});