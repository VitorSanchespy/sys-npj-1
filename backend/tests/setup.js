// Jest setup file for backend tests
const path = require('path');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'npj_test';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.DB_PORT = '5432';

// Mock Google Calendar API
jest.mock('../services/googleCalendarService', () => ({
  createEvent: jest.fn().mockResolvedValue({ id: 'mock-event-id' }),
  updateEvent: jest.fn().mockResolvedValue({ id: 'mock-event-id' }),
  deleteEvent: jest.fn().mockResolvedValue(true),
  getAuthUrl: jest.fn().mockReturnValue('https://mock-oauth-url.com'),
  handleCallback: jest.fn().mockResolvedValue({ access_token: 'mock-token' }),
  isConnected: jest.fn().mockResolvedValue(true)
}));

// Increase test timeout for API tests
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  createMockUser: () => ({
    id: 1,
    nome: 'Test User',
    email: 'test@npj.com',
    tipoUsuario: 'aluno',
    ativo: true
  }),
  
  createMockAgendamento: () => ({
    titulo: 'Test Agendamento',
    descricao: 'Test description',
    data: '2024-12-15',
    horario: '14:00',
    local: 'Test Location',
    tipoAgendamento: 'audiencia',
    processoId: 1,
    usuarioId: 1
  }),
  
  createMockProcesso: () => ({
    id: 1,
    numeroProcesso: 'TEST001/2024',
    titulo: 'Test Process',
    status: 'em_andamento'
  })
};

// Console error suppression for cleaner test output
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is deprecated')
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};
