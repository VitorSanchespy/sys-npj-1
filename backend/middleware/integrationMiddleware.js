/**
 * Middleware de Integração para Transição Modular
 * Permite alternar entre controllers monolítico e modular
 */

const config = require('../config/config.json');

// Função para obter configuração atual (permite mudança dinâmica)
function getUseModularControllers() {
  return process.env.USE_MODULAR_CONTROLLERS === 'true';
}

// Variável para controlar qual versão usar (para compatibilidade)
const USE_MODULAR_CONTROLLERS = getUseModularControllers();

/**
 * Middleware para decidir qual controller usar
 * @param {string} feature - Nome da funcionalidade (crud, convites, status)
 * @param {string} method - Nome do método do controller
 */
function routeToController(feature, method) {
  return (req, res, next) => {
    const useModular = getUseModularControllers();
    if (useModular) {
      // Usar controllers modularizados
      let controller;
      
      switch (feature) {
        case 'crud':
          controller = require('../controllers/agendamento/AgendamentoManagementController');
          break;
        case 'convites':
          controller = require('../controllers/agendamento/AgendamentoConviteController');
          break;
        case 'status':
          controller = require('../controllers/agendamento/AgendamentoStatusController');
          break;
        default:
          // Fallback para controller original
          controller = require('../controllers/agendamentoController');
      }
      
      if (controller[method] && typeof controller[method] === 'function') {
        return controller[method](req, res, next);
      } else {
        console.warn(`Método ${method} não encontrado no controller modular ${feature}`);
        // Fallback para controller original
        const originalController = require('../controllers/agendamentoController');
        if (originalController[method]) {
          return originalController[method](req, res, next);
        }
      }
    } else {
      // Usar controller monolítico original
      const originalController = require('../controllers/agendamentoController');
      if (originalController[method]) {
        return originalController[method](req, res, next);
      }
    }
    
    // Se chegou aqui, método não foi encontrado
    return res.status(500).json({
      success: false,
      message: `Método ${method} não implementado`,
      error: 'CONTROLLER_METHOD_NOT_FOUND'
    });
  };
}

/**
 * Middleware para logging de rotas
 */
function logRouteUsage(feature, method) {
  return (req, res, next) => {
    const timestamp = new Date().toISOString();
    const controllerType = getUseModularControllers() ? 'MODULAR' : 'MONOLITICO';
    
    console.log(`[${timestamp}] ${controllerType} - ${feature}.${method} - ${req.method} ${req.originalUrl}`);
    
    // Adicionar headers para debugging
    res.set('X-Controller-Type', controllerType);
    res.set('X-Controller-Feature', feature);
    res.set('X-Controller-Method', method);
    
    next();
  };
}

/**
 * Middleware para validar se a funcionalidade está disponível no modo modular
 */
function validateModularSupport(feature, method) {
  return (req, res, next) => {
    if (getUseModularControllers()) {
      const supportedMethods = {
        crud: ['criar', 'listar', 'buscarPorId', 'atualizar', 'excluir'],
        status: ['alterarStatus', 'consultarHistorico', 'consultarTransicoesDisponiveis', 'atualizarStatusAutomatico'],
        convites: ['enviarConvites', 'responderConvite', 'getStatusConvites', 'reenviarConvites']
      };
      
      if (supportedMethods[feature] && !supportedMethods[feature].includes(method)) {
        console.warn(`Método ${method} não suportado no controller modular ${feature}, usando fallback`);
        // Não bloquear, apenas avisar
      }
    }
    
    next();
  };
}

/**
 * Middleware para performance monitoring
 */
function performanceMonitor(feature, method) {
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Override do res.json para capturar o final da requisição
    const originalJson = res.json;
    res.json = function(body) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Log de performance
      console.log(`[PERFORMANCE] ${feature}.${method} - ${duration}ms`);
      
      // Adicionar header de performance
      res.set('X-Response-Time', `${duration}ms`);
      
      return originalJson.call(this, body);
    };
    
    next();
  };
}

/**
 * Função auxiliar para criar um conjunto completo de middlewares
 */
function createRouteHandler(feature, method, additionalMiddlewares = []) {
  return [
    logRouteUsage(feature, method),
    validateModularSupport(feature, method),
    performanceMonitor(feature, method),
    ...additionalMiddlewares,
    routeToController(feature, method)
  ];
}

/**
 * Helper para mapear métodos antigos para novos
 */
const methodMapping = {
  // Métodos CRUD
  'criar': { feature: 'crud', method: 'criar' },
  'listar': { feature: 'crud', method: 'listar' },
  'buscarPorId': { feature: 'crud', method: 'buscarPorId' },
  'atualizar': { feature: 'crud', method: 'atualizar' },
  'deletar': { feature: 'crud', method: 'excluir' },
  
  // Métodos de Status
  'marcarStatus': { feature: 'status', method: 'alterarStatus' },
  
  // Métodos de Convites
  'aceitarConvite': { feature: 'convites', method: 'responderConvite' },
  'recusarConvite': { feature: 'convites', method: 'responderConvite' },
  'aceitarConvitePublico': { feature: 'convites', method: 'responderConvite' },
  'recusarConvitePublico': { feature: 'convites', method: 'responderConvite' }
};

/**
 * Função para criar handler baseado no método original
 */
function createMappedHandler(originalMethod, additionalMiddlewares = []) {
  const mapping = methodMapping[originalMethod];
  
  if (mapping) {
    return createRouteHandler(mapping.feature, mapping.method, additionalMiddlewares);
  } else {
    // Para métodos não mapeados, usar o controller original
    return [
      logRouteUsage('legacy', originalMethod),
      performanceMonitor('legacy', originalMethod),
      ...additionalMiddlewares,
      (req, res, next) => {
        const originalController = require('../controllers/agendamentoController');
        if (originalController[originalMethod]) {
          return originalController[originalMethod](req, res, next);
        } else {
          return res.status(500).json({
            success: false,
            message: `Método ${originalMethod} não encontrado`,
            error: 'METHOD_NOT_FOUND'
          });
        }
      }
    ];
  }
}

module.exports = {
  routeToController,
  logRouteUsage,
  validateModularSupport,
  performanceMonitor,
  createRouteHandler,
  createMappedHandler,
  getUseModularControllers,
  USE_MODULAR_CONTROLLERS
};