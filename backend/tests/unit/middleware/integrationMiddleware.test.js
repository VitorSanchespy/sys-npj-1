/**
 * Testes unitários para Middleware de Integração
 * Valida o funcionamento da lógica de roteamento entre controllers
 */

const { 
  routeToController, 
  createMappedHandler, 
  createRouteHandler,
  USE_MODULAR_CONTROLLERS 
} = require('../../../middleware/integrationMiddleware');

// Mock dos controllers
jest.mock('../../../controllers/agendamento/AgendamentoManagementController', () => ({
  criar: jest.fn(),
  listar: jest.fn(),
  buscarPorId: jest.fn(),
  atualizar: jest.fn(),
  excluir: jest.fn()
}));

jest.mock('../../../controllers/agendamento/AgendamentoConviteController', () => ({
  enviarConvites: jest.fn(),
  responderConvite: jest.fn(),
  getStatusConvites: jest.fn(),
  reenviarConvites: jest.fn()
}));

jest.mock('../../../controllers/agendamento/AgendamentoStatusController', () => ({
  alterarStatus: jest.fn(),
  consultarHistorico: jest.fn(),
  consultarTransicoesDisponiveis: jest.fn(),
  atualizarStatusAutomatico: jest.fn()
}));

jest.mock('../../../controllers/agendamentoController', () => ({
  criar: jest.fn(),
  listar: jest.fn(),
  buscarPorId: jest.fn(),
  atualizar: jest.fn(),
  deletar: jest.fn(),
  aceitarConvitePublico: jest.fn(),
  recusarConvitePublico: jest.fn()
}));

describe('Middleware de Integração', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      originalUrl: '/api/agendamentos',
      params: {},
      body: {},
      query: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      set: jest.fn()
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('routeToController', () => {
    test('deve rotear para controller modular quando habilitado', () => {
      // Simular modo modular
      process.env.USE_MODULAR_CONTROLLERS = 'true';
      
      // Recarregar o módulo para pegar a nova configuração
      delete require.cache[require.resolve('../../../middleware/integrationMiddleware')];
      const integrationMiddleware = require('../../../middleware/integrationMiddleware');
      
      const middleware = integrationMiddleware.routeToController('crud', 'listar');
      const AgendamentoManagementController = require('../../../controllers/agendamento/AgendamentoManagementController');
      
      middleware(mockReq, mockRes, mockNext);
      
      expect(AgendamentoManagementController.listar).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    });

    test('deve rotear para controller monolítico quando desabilitado', () => {
      // Simular modo monolítico
      process.env.USE_MODULAR_CONTROLLERS = 'false';
      
      // Recarregar o módulo
      delete require.cache[require.resolve('../../../middleware/integrationMiddleware')];
      const integrationMiddleware = require('../../../middleware/integrationMiddleware');
      
      const middleware = integrationMiddleware.routeToController('crud', 'listar');
      const agendamentoController = require('../../../controllers/agendamentoController');
      
      middleware(mockReq, mockRes, mockNext);
      
      expect(agendamentoController.listar).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    });

    test('deve fazer fallback para controller original quando método não existe no modular', () => {
      process.env.USE_MODULAR_CONTROLLERS = 'true';
      
      delete require.cache[require.resolve('../../../middleware/integrationMiddleware')];
      const integrationMiddleware = require('../../../middleware/integrationMiddleware');
      
      const middleware = integrationMiddleware.routeToController('crud', 'metodoInexistente');
      const agendamentoController = require('../../../controllers/agendamentoController');
      
      // Mock do método inexistente no controller original
      agendamentoController.metodoInexistente = jest.fn();
      
      middleware(mockReq, mockRes, mockNext);
      
      expect(agendamentoController.metodoInexistente).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    });

    test('deve retornar erro quando método não existe em nenhum controller', () => {
      process.env.USE_MODULAR_CONTROLLERS = 'true';
      
      delete require.cache[require.resolve('../../../middleware/integrationMiddleware')];
      const integrationMiddleware = require('../../../middleware/integrationMiddleware');
      
      const middleware = integrationMiddleware.routeToController('crud', 'metodoTotalmenteInexistente');
      
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Método metodoTotalmenteInexistente não implementado',
          error: 'CONTROLLER_METHOD_NOT_FOUND'
        })
      );
    });
  });

  describe('Controllers especializados', () => {
    beforeEach(() => {
      process.env.USE_MODULAR_CONTROLLERS = 'true';
      delete require.cache[require.resolve('../../../middleware/integrationMiddleware')];
    });

    test('deve rotear métodos CRUD para AgendamentoManagementController', () => {
      const integrationMiddleware = require('../../../middleware/integrationMiddleware');
      const AgendamentoManagementController = require('../../../controllers/agendamento/AgendamentoManagementController');
      
      const methods = ['criar', 'listar', 'buscarPorId', 'atualizar', 'excluir'];
      
      methods.forEach(method => {
        const middleware = integrationMiddleware.routeToController('crud', method);
        middleware(mockReq, mockRes, mockNext);
        
        expect(AgendamentoManagementController[method]).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      });
    });

    test('deve rotear métodos de convites para AgendamentoConviteController', () => {
      const integrationMiddleware = require('../../../middleware/integrationMiddleware');
      const AgendamentoConviteController = require('../../../controllers/agendamento/AgendamentoConviteController');
      
      const methods = ['enviarConvites', 'responderConvite', 'getStatusConvites', 'reenviarConvites'];
      
      methods.forEach(method => {
        const middleware = integrationMiddleware.routeToController('convites', method);
        middleware(mockReq, mockRes, mockNext);
        
        expect(AgendamentoConviteController[method]).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      });
    });

    test('deve rotear métodos de status para AgendamentoStatusController', () => {
      const integrationMiddleware = require('../../../middleware/integrationMiddleware');
      const AgendamentoStatusController = require('../../../controllers/agendamento/AgendamentoStatusController');
      
      const methods = ['alterarStatus', 'consultarHistorico', 'consultarTransicoesDisponiveis', 'atualizarStatusAutomatico'];
      
      methods.forEach(method => {
        const middleware = integrationMiddleware.routeToController('status', method);
        middleware(mockReq, mockRes, mockNext);
        
        expect(AgendamentoStatusController[method]).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      });
    });
  });

  describe('createMappedHandler', () => {
    test('deve mapear métodos conhecidos corretamente', () => {
      process.env.USE_MODULAR_CONTROLLERS = 'true';
      delete require.cache[require.resolve('../../../middleware/integrationMiddleware')];
      
      const integrationMiddleware = require('../../../middleware/integrationMiddleware');
      const handlers = integrationMiddleware.createMappedHandler('criar');
      
      expect(handlers).toBeInstanceOf(Array);
      expect(handlers.length).toBeGreaterThan(0);
    });

    test('deve usar controller legacy para métodos não mapeados', () => {
      process.env.USE_MODULAR_CONTROLLERS = 'true';
      delete require.cache[require.resolve('../../../middleware/integrationMiddleware')];
      
      const integrationMiddleware = require('../../../middleware/integrationMiddleware');
      const handlers = integrationMiddleware.createMappedHandler('metodoLegacy');
      
      expect(handlers).toBeInstanceOf(Array);
      expect(handlers.length).toBeGreaterThan(0);
    });
  });

  describe('Middleware de logging e performance', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test('deve adicionar headers de debugging', () => {
      process.env.USE_MODULAR_CONTROLLERS = 'true';
      delete require.cache[require.resolve('../../../middleware/integrationMiddleware')];
      
      const integrationMiddleware = require('../../../middleware/integrationMiddleware');
      const logMiddleware = integrationMiddleware.logRouteUsage('crud', 'listar');
      
      logMiddleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.set).toHaveBeenCalledWith('X-Controller-Type', 'MODULAR');
      expect(mockRes.set).toHaveBeenCalledWith('X-Controller-Feature', 'crud');
      expect(mockRes.set).toHaveBeenCalledWith('X-Controller-Method', 'listar');
      expect(mockNext).toHaveBeenCalled();
    });

    test('deve medir performance', () => {
      process.env.USE_MODULAR_CONTROLLERS = 'true';
      delete require.cache[require.resolve('../../../middleware/integrationMiddleware')];
      
      const integrationMiddleware = require('../../../middleware/integrationMiddleware');
      const perfMiddleware = integrationMiddleware.performanceMonitor('crud', 'listar');
      
      perfMiddleware(mockReq, mockRes, mockNext);
      
      // Simular chamada do res.json
      const mockData = { success: true };
      mockRes.json(mockData);
      
      expect(mockRes.set).toHaveBeenCalledWith('X-Response-Time', expect.stringMatching(/\d+ms/));
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Configuração de ambiente', () => {
    test('deve usar modo monolítico por padrão', () => {
      delete process.env.USE_MODULAR_CONTROLLERS;
      delete require.cache[require.resolve('../../../middleware/integrationMiddleware')];
      
      const integrationMiddleware = require('../../../middleware/integrationMiddleware');
      
      expect(integrationMiddleware.USE_MODULAR_CONTROLLERS).toBe(false);
    });

    test('deve respeitar variável de ambiente para modo modular', () => {
      process.env.USE_MODULAR_CONTROLLERS = 'true';
      delete require.cache[require.resolve('../../../middleware/integrationMiddleware')];
      
      const integrationMiddleware = require('../../../middleware/integrationMiddleware');
      
      expect(integrationMiddleware.USE_MODULAR_CONTROLLERS).toBe(true);
    });
  });
});