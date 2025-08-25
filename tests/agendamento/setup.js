/**
 * Setup para Testes do Módulo de Agendamento
 * Configurações globais e mocks necessários
 */

// Mock do console para testes silenciosos
if (process.env.SILENT_TESTS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };
}

// Mock de variáveis de ambiente
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_NAME = 'npj_test';
process.env.EMAIL_HOST = 'smtp.test.com';
process.env.EMAIL_PORT = '587';

// Mock do banco de dados
const mockDatabase = {
  agendamentos: [],
  usuarios: [],
  convidados: [],
  logs_acoes: []
};

global.mockDB = mockDatabase;

// Mock de funções de utilidade
global.mockUtils = {
  formatDate: (date) => new Date(date).toLocaleDateString('pt-BR'),
  formatDateTime: (date) => new Date(date).toLocaleString('pt-BR'),
  generateToken: () => 'mock-token-' + Date.now(),
  hashPassword: (password) => 'hashed-' + password,
  validateEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
};

// Setup global antes de cada teste
beforeEach(() => {
  // Limpar mocks
  jest.clearAllMocks();
  
  // Reset do banco mock
  Object.keys(mockDatabase).forEach(table => {
    mockDatabase[table] = [];
  });
  
  // Mock do Date para testes consistentes
  const mockDate = new Date('2025-08-25T12:00:00Z');
  global.Date = class extends Date {
    constructor(...args) {
      if (args.length === 0) {
        return mockDate;
      }
      return new Date(...args);
    }
    
    static now() {
      return mockDate.getTime();
    }
  };
});

// Cleanup após cada teste
afterEach(() => {
  // Restore Date original
  global.Date = Date;
});

// Mock de bibliotecas externas
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-message-id' })
  }))
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true)
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
  verify: jest.fn(() => ({ id: 1, email: 'test@npj.com' }))
}));

// Timeout global para testes
jest.setTimeout(10000);

console.log('🔧 Setup de testes carregado - Módulo de Agendamento NPJ');
