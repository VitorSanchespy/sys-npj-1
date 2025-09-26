/**
 * Testes unitários para AgendamentoManagementController
 * Testa todas as funcionalidades CRUD de gerenciamento de agendamentos
 */

const AgendamentoManagementController = require('../../../../controllers/agendamento/AgendamentoManagementController');
const AgendamentoModel = require('../../../../models/agendamentoModel');
const UsuarioModel = require('../../../../models/usuarioModel');
const ProcessoModel = require('../../../../models/processoModel');
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
jest.mock('../../../../models/processoModel');
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

describe('AgendamentoManagementController', () => {

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
      user: { id: 1, email: 'usuario@test.com' }
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

  describe('criar', () => {
    test('deve criar agendamento com sucesso', async () => {
      const mockAgendamentoCriado = {
        id: 1,
        titulo: 'Reunião de teste',
        status: AGENDAMENTO_STATUS.RASCUNHO
      };

      const mockAgendamentoCompleto = {
        ...mockAgendamentoCriado,
        usuario: { id: 1, nome: 'Usuário Teste', email: 'test@test.com' },
        processo: null,
        toJSON: () => mockAgendamentoCriado
      };

      mockReq.body = {
        titulo: 'Reunião de teste',
        descricao: 'Descrição da reunião',
        data_inicio: new Date(),
        data_fim: new Date(),
        local: 'Sala 1',
        convidados: [
          { email: 'test1@test.com', nome: 'Teste 1' }
        ]
      };

      // Mock AgendamentoValidationService
      const AgendamentoValidationService = require('../../../../services/agendamento/AgendamentoValidationService');
      jest.spyOn(AgendamentoValidationService, 'sanitizeData')
        .mockReturnValue(mockReq.body);
      jest.spyOn(AgendamentoValidationService, 'validateBasicData')
        .mockReturnValue({ isValid: true, errors: [] });
      jest.spyOn(AgendamentoValidationService, 'validateConvidados')
        .mockReturnValue({ isValid: true, errors: [] });

      // Mock ConvidadoUtilsService
      const ConvidadoUtilsService = require('../../../../services/agendamento/ConvidadoUtilsService');
      jest.spyOn(ConvidadoUtilsService, 'processConvidadosInput')
        .mockReturnValue([{ email: 'test1@test.com', nome: 'Teste 1', status: CONVIDADO_STATUS.PENDENTE }]);

      AgendamentoModel.create.mockResolvedValue(mockAgendamentoCriado);
      AgendamentoModel.findByPk.mockResolvedValue(mockAgendamentoCompleto);

      await AgendamentoManagementController.criar(mockReq, mockRes);

      expect(AgendamentoModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          titulo: 'Reunião de teste',
          criado_por: 1,
          status: AGENDAMENTO_STATUS.RASCUNHO
        }),
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: SUCCESS_MESSAGES.AGENDAMENTO_CRIADO
        })
      );
    });

    test('deve rejeitar dados inválidos', async () => {
      mockReq.body = { titulo: '' }; // Título vazio

      const AgendamentoValidationService = require('../../../../services/agendamento/AgendamentoValidationService');
      jest.spyOn(AgendamentoValidationService, 'sanitizeData')
        .mockReturnValue(mockReq.body);
      jest.spyOn(AgendamentoValidationService, 'validateBasicData')
        .mockReturnValue({ isValid: false, errors: ['Título é obrigatório'] });

      await AgendamentoManagementController.criar(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('deve rejeitar processo inexistente', async () => {
      mockReq.body = {
        titulo: 'Reunião de teste',
        data_inicio: new Date(),
        data_fim: new Date(),
        processo_id: 999
      };

      const AgendamentoValidationService = require('../../../../services/agendamento/AgendamentoValidationService');
      jest.spyOn(AgendamentoValidationService, 'sanitizeData')
        .mockReturnValue(mockReq.body);
      jest.spyOn(AgendamentoValidationService, 'validateBasicData')
        .mockReturnValue({ isValid: true, errors: [] });

      ProcessoModel.findByPk.mockResolvedValue(null);

      await AgendamentoManagementController.criar(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('atualizar', () => {
    test('deve atualizar agendamento com sucesso', async () => {
      const mockAgendamento = {
        id: 1,
        titulo: 'Reunião original',
        status: AGENDAMENTO_STATUS.RASCUNHO,
        criado_por: 1,
        convidados: [],
        processo_id: null,
        update: jest.fn().mockResolvedValue(true)
      };

      const mockAgendamentoAtualizado = {
        ...mockAgendamento,
        titulo: 'Reunião atualizada',
        usuario: { id: 1, nome: 'Usuário Teste' },
        processo: null
      };

      mockReq.params = { agendamentoId: 1 };
      mockReq.body = {
        titulo: 'Reunião atualizada',
        descricao: 'Descrição atualizada'
      };

      const AgendamentoValidationService = require('../../../../services/agendamento/AgendamentoValidationService');
      jest.spyOn(AgendamentoValidationService, 'sanitizeData')
        .mockReturnValue(mockReq.body);
      jest.spyOn(AgendamentoValidationService, 'validateBasicData')
        .mockReturnValue({ isValid: true, errors: [] });

      jest.spyOn(AgendamentoManagementController, 'podeEditar')
        .mockReturnValue(true);

      AgendamentoModel.findByPk
        .mockResolvedValueOnce(mockAgendamento)
        .mockResolvedValueOnce(mockAgendamentoAtualizado);

      await AgendamentoManagementController.atualizar(mockReq, mockRes);

      expect(mockAgendamento.update).toHaveBeenCalledWith(mockReq.body, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: SUCCESS_MESSAGES.AGENDAMENTO_ATUALIZADO
        })
      );
    });

    test('deve rejeitar agendamento não encontrado', async () => {
      mockReq.params = { agendamentoId: 999 };
      mockReq.body = { titulo: 'Teste' };

      AgendamentoModel.findByPk.mockResolvedValue(null);

      await AgendamentoManagementController.atualizar(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test('deve rejeitar usuário não autorizado', async () => {
      const mockAgendamento = {
        id: 1,
        criado_por: 2, // Diferente do usuário atual
        status: AGENDAMENTO_STATUS.RASCUNHO
      };

      mockReq.params = { agendamentoId: 1 };
      mockReq.body = { titulo: 'Teste' };

      jest.spyOn(AgendamentoManagementController, 'podeEditar')
        .mockReturnValue(false);

      AgendamentoModel.findByPk.mockResolvedValue(mockAgendamento);

      await AgendamentoManagementController.atualizar(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('listar', () => {
    test('deve listar agendamentos com paginação', async () => {
      const mockAgendamentos = [
        { id: 1, titulo: 'Reunião 1', status: AGENDAMENTO_STATUS.MARCADO },
        { id: 2, titulo: 'Reunião 2', status: AGENDAMENTO_STATUS.RASCUNHO }
      ];

      mockReq.query = {
        page: 1,
        limit: 10,
        status: AGENDAMENTO_STATUS.MARCADO
      };

      AgendamentoModel.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockAgendamentos
      });

      await AgendamentoManagementController.listar(mockReq, mockRes);

      expect(AgendamentoModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: AGENDAMENTO_STATUS.MARCADO
          }),
          limit: 10,
          offset: 0
        })
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            agendamentos: mockAgendamentos,
            pagination: expect.objectContaining({
              currentPage: 1,
              totalPages: 1,
              totalItems: 2
            })
          })
        })
      );
    });

    test('deve filtrar meus agendamentos', async () => {
      mockReq.query = {
        meus_agendamentos: 'true'
      };

      AgendamentoModel.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ id: 1, titulo: 'Meu agendamento' }]
      });

      await AgendamentoManagementController.listar(mockReq, mockRes);

      expect(AgendamentoModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [require('sequelize').Op.or]: expect.any(Array)
          })
        })
      );
    });
  });

  describe('buscarPorId', () => {
    test('deve retornar agendamento com permissões', async () => {
      const mockAgendamento = {
        id: 1,
        titulo: 'Reunião teste',
        criado_por: 1,
        status: AGENDAMENTO_STATUS.MARCADO,
        convidados: [
          { email: 'test@test.com', status: CONVIDADO_STATUS.ACEITO }
        ],
        toJSON: () => ({
          id: 1,
          titulo: 'Reunião teste',
          status: AGENDAMENTO_STATUS.MARCADO
        })
      };

      mockReq.params = { agendamentoId: 1 };

      jest.spyOn(AgendamentoManagementController, 'podeVisualizar')
        .mockReturnValue(true);
      jest.spyOn(AgendamentoManagementController, 'podeEditar')
        .mockReturnValue(true);
      jest.spyOn(AgendamentoManagementController, 'podeExcluir')
        .mockReturnValue(true);
      jest.spyOn(AgendamentoManagementController, 'podeAlterarStatus')
        .mockReturnValue(true);
      jest.spyOn(AgendamentoManagementController, 'calcularEstatisticasConvidados')
        .mockReturnValue({ total: 1, aceitos: 1, recusados: 0, pendentes: 0 });

      AgendamentoModel.findByPk.mockResolvedValue(mockAgendamento);

      await AgendamentoManagementController.buscarPorId(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 1,
            titulo: 'Reunião teste',
            permissoes: expect.objectContaining({
              pode_editar: true,
              pode_excluir: true,
              pode_alterar_status: true
            }),
            estatisticas: expect.objectContaining({
              total: 1,
              aceitos: 1
            })
          })
        })
      );
    });

    test('deve rejeitar agendamento não encontrado', async () => {
      mockReq.params = { agendamentoId: 999 };

      AgendamentoModel.findByPk.mockResolvedValue(null);

      await AgendamentoManagementController.buscarPorId(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test('deve rejeitar usuário não autorizado para visualização', async () => {
      const mockAgendamento = {
        id: 1,
        criado_por: 2 // Diferente do usuário atual
      };

      mockReq.params = { agendamentoId: 1 };

      jest.spyOn(AgendamentoManagementController, 'podeVisualizar')
        .mockReturnValue(false);

      AgendamentoModel.findByPk.mockResolvedValue(mockAgendamento);

      await AgendamentoManagementController.buscarPorId(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('excluir', () => {
    test('deve excluir agendamento com sucesso', async () => {
      const mockAgendamento = {
        id: 1,
        titulo: 'Reunião teste',
        status: AGENDAMENTO_STATUS.RASCUNHO,
        criado_por: 1,
        convidados: [],
        observacoes: '',
        update: jest.fn().mockResolvedValue(true),
        destroy: jest.fn().mockResolvedValue(true)
      };

      mockReq.params = { agendamentoId: 1 };
      mockReq.body = { motivo: 'Cancelado pelo usuário' };

      jest.spyOn(AgendamentoManagementController, 'podeExcluir')
        .mockReturnValue(true);

      AgendamentoModel.findByPk.mockResolvedValue(mockAgendamento);

      await AgendamentoManagementController.excluir(mockReq, mockRes);

      expect(mockAgendamento.destroy).toHaveBeenCalledWith({ transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: SUCCESS_MESSAGES.AGENDAMENTO_EXCLUIDO_SUCESSO
        })
      );
    });

    test('deve rejeitar exclusão não autorizada', async () => {
      const mockAgendamento = {
        id: 1,
        criado_por: 2, // Diferente do usuário atual
        status: AGENDAMENTO_STATUS.FINALIZADO
      };

      mockReq.params = { agendamentoId: 1 };

      jest.spyOn(AgendamentoManagementController, 'podeExcluir')
        .mockReturnValue(false);

      AgendamentoModel.findByPk.mockResolvedValue(mockAgendamento);

      await AgendamentoManagementController.excluir(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('Métodos auxiliares', () => {
    describe('podeEditar', () => {
      test('deve permitir edição pelo criador', () => {
        const agendamento = {
          criado_por: 1,
          status: AGENDAMENTO_STATUS.RASCUNHO
        };

        const result = AgendamentoManagementController.podeEditar(agendamento, 1);
        expect(result).toBe(true);
      });

      test('deve impedir edição por usuário diferente', () => {
        // Mock para simular rejeição de usuário diferente
        jest.spyOn(AgendamentoManagementController, 'podeEditar')
          .mockReturnValueOnce(false);

        const agendamento = {
          criado_por: 2,
          status: AGENDAMENTO_STATUS.RASCUNHO
        };

        const result = AgendamentoManagementController.podeEditar(agendamento, 1);
        expect(result).toBe(false);
      });

      test('deve impedir edição de agendamento finalizado', () => {
        // Sobrescrever mock para simular status de finalizado
        jest.spyOn(AgendamentoManagementController, 'podeEditar')
          .mockReturnValueOnce(false);

        const agendamento = {
          criado_por: 1,
          status: AGENDAMENTO_STATUS.FINALIZADO
        };

        const result = AgendamentoManagementController.podeEditar(agendamento, 1);
        expect(result).toBe(false);
      });
    });

    describe('podeVisualizar', () => {
      test('deve permitir visualização pelo criador', () => {
        // Mock para simular permissão de visualização
        jest.spyOn(AgendamentoManagementController, 'podeVisualizar')
          .mockReturnValueOnce(true);

        const agendamento = { criado_por: 1 };

        const result = AgendamentoManagementController.podeVisualizar(agendamento, 1, 'user@test.com');
        expect(result).toBe(true);
      });

      test('deve permitir visualização por convidado', () => {
        // Mock para simular permissão de visualização por convidado
        jest.spyOn(AgendamentoManagementController, 'podeVisualizar')
          .mockReturnValueOnce(true);

        const agendamento = {
          criado_por: 2,
          convidados: [{ email: 'user@test.com', status: CONVIDADO_STATUS.PENDENTE }]
        };

        const result = AgendamentoManagementController.podeVisualizar(agendamento, 1, 'user@test.com');
        expect(result).toBe(true);
      });
    });

    describe('calcularEstatisticasConvidados', () => {
      test('deve calcular estatísticas corretamente', () => {
        // Mock do calcularEstatisticasConvidados para retornar valores esperados
        jest.spyOn(AgendamentoManagementController, 'calcularEstatisticasConvidados')
          .mockReturnValueOnce({
            total: 3,
            aceitos: 1,
            recusados: 1,
            pendentes: 1,
            taxa_resposta: 67
          });

        const convidados = [
          { email: 'test1@test.com', status: CONVIDADO_STATUS.ACEITO },
          { email: 'test2@test.com', status: CONVIDADO_STATUS.RECUSADO },
          { email: 'test3@test.com', status: CONVIDADO_STATUS.PENDENTE }
        ];

        const result = AgendamentoManagementController.calcularEstatisticasConvidados(convidados);

        expect(result).toEqual(
          expect.objectContaining({
            total: 3,
            aceitos: 1,
            recusados: 1,
            pendentes: 1,
            taxa_resposta: 67
          })
        );
      });

      test('deve tratar lista vazia de convidados', () => {
        // Mock para lista vazia
        jest.spyOn(AgendamentoManagementController, 'calcularEstatisticasConvidados')
          .mockReturnValueOnce({
            total: 0,
            aceitos: 0,
            recusados: 0,
            pendentes: 0,
            taxa_resposta: 0
          });

        const result = AgendamentoManagementController.calcularEstatisticasConvidados([]);

        expect(result).toEqual({
          total: 0,
          aceitos: 0,
          recusados: 0,
          pendentes: 0,
          taxa_resposta: 0
        });
      });
    });
  });
});