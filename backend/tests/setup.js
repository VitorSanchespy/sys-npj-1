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

// Mock Google Calendar API - Enhanced
jest.mock('../services/calendarService', () => ({
  isAvailable: jest.fn(() => true),
  createEvent: jest.fn(() => Promise.resolve({
    success: true,
    eventId: 'mock-google-event-id',
    htmlLink: 'https://calendar.google.com/mock-event'
  })),
  updateEvent: jest.fn(() => Promise.resolve({
    success: true,
    eventId: 'mock-google-event-id',
    htmlLink: 'https://calendar.google.com/mock-event'
  })),
  deleteEvent: jest.fn(() => Promise.resolve({
    success: true
  })),
  listEvents: jest.fn(() => Promise.resolve({
    success: true,
    events: []
  }))
}));

// Mock Enhanced Notification Service
jest.mock('../services/enhancedNotificationService', () => ({
  isConfigured: jest.fn(() => true),
  sendCustomNotification: jest.fn(() => Promise.resolve(true)),
  sendReminderEmail: jest.fn(() => Promise.resolve(true)),
  checkUpcomingEvents: jest.fn(() => Promise.resolve()),
  generateEmailTemplate: jest.fn((agendamento) => ({
    subject: `Lembrete: ${agendamento.summary}`,
    html: `<p>Reunião: ${agendamento.summary}</p>`
  }))
}));

// Increase test timeout for API tests
jest.setTimeout(30000);

// Global test utilities - Enhanced
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
  }),

  // Helpers específicos para Google Calendar
  validAgendamentoData: (overrides = {}) => ({
    processo_id: 1,
    start: new Date(Date.now() + 24 * 60 * 60 * 1000),
    end: new Date(Date.now() + 25 * 60 * 60 * 1000),
    summary: 'Reunião de Teste',
    tipo_evento: 'Reunião',
    status: 'ativo',
    ...overrides
  }),

  // Simular delay para testes de performance
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock de JWT token
  mockJwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token'
};

// Console helpers para testes visuais
global.testLog = {
  info: (message) => console.log(`ℹ️  ${message}`),
  success: (message) => console.log(`✅ ${message}`),
  warning: (message) => console.log(`⚠️  ${message}`),
  error: (message) => console.log(`❌ ${message}`),
  step: (message) => console.log(`🔹 ${message}`)
};

// Console error suppression for cleaner test output
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is deprecated') ||
     args[0].includes('deprecated'))
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};
