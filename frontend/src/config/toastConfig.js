/**
 * CONFIGURAÇÃO GLOBAL DO SISTEMA DE TOAST
 * 
 * Este arquivo deve ser importado no App.js ou index.js para
 * configurar o sistema de toast audit globalmente.
 */

import { setupGlobalToastInterception, setToastDebugMode } from '../hooks/useToastSystem';

/**
 * Configurações do sistema de toast
 */
const TOAST_CONFIG = {
  // Habilitar interceptação automática de APIs
  enableAutoInterception: true,
  
  // Modo debug (mostrar logs no console)
  debugMode: false,
  
  // Configuração do react-toastify
  toastifyConfig: {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    newestOnTop: false,
    closeOnClick: true,
    rtl: false,
    pauseOnFocusLoss: true,
    draggable: true,
    pauseOnHover: true,
    theme: "light"
  },
  
  // Configurações de anti-duplicação
  antiDuplication: {
    enabled: true,
    timeWindow: 3000, // 3 segundos
    maxSimilarToasts: 1
  },
  
  // Configurações de categorização
  categorization: {
    enabled: true,
    useIcons: true,
    useColors: true
  },
  
  // Configurações de produção vs desenvolvimento
  production: {
    debugMode: false,
    autoClose: 4000,
    showDetailedErrors: false
  },
  
  development: {
    debugMode: true,
    autoClose: 8000,
    showDetailedErrors: true
  }
};

/**
 * Inicializar sistema de toast
 */
export const initializeToastSystem = () => {
  console.log('🎯 Inicializando Sistema de Toast Audit...');
  
  // Determinar ambiente
  const isDevelopment = process.env.NODE_ENV === 'development';
  const config = isDevelopment ? TOAST_CONFIG.development : TOAST_CONFIG.production;
  
  // Configurar modo debug
  setToastDebugMode(config.debugMode);
  
  // Configurar interceptação automática
  if (TOAST_CONFIG.enableAutoInterception) {
    setupGlobalToastInterception();
    console.log('✅ Interceptação automática de API configurada');
  }
  
  // Log de inicialização
  console.log(`✅ Sistema de Toast Audit inicializado (${isDevelopment ? 'DEV' : 'PROD'})`);
  console.log('📋 Configurações:', {
    debugMode: config.debugMode,
    autoClose: config.autoClose,
    antiDuplication: TOAST_CONFIG.antiDuplication.enabled,
    categorization: TOAST_CONFIG.categorization.enabled
  });
};

/**
 * Configurar react-toastify com nossas configurações
 */
export const getToastifyConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const config = isDevelopment ? TOAST_CONFIG.development : TOAST_CONFIG.production;
  
  return {
    ...TOAST_CONFIG.toastifyConfig,
    autoClose: config.autoClose
  };
};

/**
 * Obter configurações do sistema
 */
export const getToastConfig = () => TOAST_CONFIG;

/**
 * Atualizar configurações em tempo de execução
 */
export const updateToastConfig = (newConfig) => {
  Object.assign(TOAST_CONFIG, newConfig);
  
  // Reaplicar configurações
  if (newConfig.debugMode !== undefined) {
    setToastDebugMode(newConfig.debugMode);
  }
  
  console.log('🔄 Configurações do toast atualizadas:', newConfig);
};

// Auto-inicialização se não estiver em ambiente de teste
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
  // Aguardar DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeToastSystem);
  } else {
    initializeToastSystem();
  }
}

export default {
  initializeToastSystem,
  getToastifyConfig,
  getToastConfig,
  updateToastConfig
};
