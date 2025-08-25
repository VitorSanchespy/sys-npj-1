
// Mock do Calendar Service Local deve vir ANTES de qualquer importação que use o serviço
jest.mock('../../services/calendarService', () => ({
  isAvailable: () => true,
  createEvent: jest.fn().mockResolvedValue({
    success: true,
    eventId: 'local-event-id',
    local: true
  }),
  updateEvent: jest.fn().mockResolvedValue({
    success: true,
    eventId: 'mock-google-event-id'
  }),
  deleteEvent: jest.fn().mockResolvedValue({
    success: true
  }),
  listEvents: jest.fn().mockResolvedValue({
    success: true,
    events: []
  })
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../index');
const sequelize = require('../../utils/sequelize');
const { 
  processoModel: Processo, 
  usuarioModel: Usuario,
  agendamentoProcessoModel: AgendamentoProcesso,
  roleModel: Role
} = require('../../models/indexModel');

describe('Agendamentos API Tests', () => {
  let authToken;
  let testUser;
  let testProcesso;
  let testRole;

  beforeAll(async () => {
    // Sincronizar banco de dados para testes
    await sequelize.sync({ force: true });

    // Criar role de teste
    testRole = await Role.create({
      nome: 'Admin',
      descricao: 'Administrador de teste'
    });

    // Criar usuário de teste
    testUser = await Usuario.create({
      nome: 'Usuário Teste',
      email: 'teste@npj.com',
      senha: 'senha123',
      role_id: testRole.id
    });

    // Gerar token JWT
    authToken = jwt.sign(
      { 
        id: testUser.id, 
        email: testUser.email, 
        role: testRole.nome 
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Criar processo de teste
    testProcesso = await Processo.create({
      numero_processo: 'TEST-001',
      titulo: 'Processo de Teste para Agendamentos',
      status: 'Em Andamento',
      responsavel_id: testUser.id
    });
  });

  afterAll(async () => {
    // Limpar dados de teste
    await AgendamentoProcesso.destroy({ where: {} });
    await Processo.destroy({ where: {} });
    await Usuario.destroy({ where: {} });
    await Role.destroy({ where: {} });
    await sequelize.close();
  });

  afterEach(async () => {
    // Limpar agendamentos após cada teste
    await AgendamentoProcesso.destroy({ where: {} });
  });

  describe('Autenticação e Autorização', () => {
    it('deve retornar 401 ao acessar endpoint sem token', async () => {
      const response = await request(app)
        .get('/api/agendamentos-global')
        .expect(401);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve retornar 200 ao acessar endpoint com token válido', async () => {
      const response = await request(app)
        .get('/api/agendamentos-global')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('agendamentos');
    });
  });

  describe('CRUD de Agendamentos', () => {
    it('deve criar um novo agendamento', async () => {
      const agendamentoData = {
        summary: 'Reunião de Teste',
  tipo: 'Reunião',
        start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
        end: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // Amanhã + 1h
        location: 'Sala de Teste',
        description: 'Descrição do agendamento de teste'
      };

      const response = await request(app)
        .post(`/api/processos/${testProcesso.id}/agendamentos-processo`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(agendamentoData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.agendamento).toHaveProperty('id');
      expect(response.body.data.agendamento).toHaveProperty('google_event_id', 'mock-google-event-id');
      expect(response.body.data.agendamento).toHaveProperty('status', 'sincronizado');
      expect(response.body.data.agendamento.summary).toBe(agendamentoData.summary);

      // Verificar no banco de dados
      const agendamentoDB = await AgendamentoProcesso.findByPk(response.body.data.agendamento.id);
      expect(agendamentoDB).toBeTruthy();
      expect(agendamentoDB.processo_id).toBe(testProcesso.id);
      expect(agendamentoDB.google_event_id).toBe('mock-google-event-id');
    });

    it('deve atualizar um agendamento existente', async () => {
      // Criar agendamento primeiro
      const agendamento = await AgendamentoProcesso.create({
        processo_id: testProcesso.id,
        summary: 'Agendamento Original',
  tipo: 'Reunião',
        start: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000),
        status: 'sincronizado',
        google_event_id: 'mock-event-id'
      });

      const updateData = {
        summary: 'Agendamento Atualizado',
        start: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Depois de amanhã
        end: new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .put(`/api/agendamentos-global/${agendamento.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.agendamento.summary).toBe(updateData.summary);

      // Verificar no banco de dados
      const agendamentoAtualizado = await AgendamentoProcesso.findByPk(agendamento.id);
      expect(agendamentoAtualizado.summary).toBe(updateData.summary);
    });

    it('deve deletar/cancelar um agendamento', async () => {
      // Criar agendamento primeiro
      const agendamento = await AgendamentoProcesso.create({
        processo_id: testProcesso.id,
        summary: 'Agendamento para Deletar',
  tipo: 'Reunião',
        start: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000),
        status: 'sincronizado',
        google_event_id: 'mock-event-id'
      });

      const response = await request(app)
        .delete(`/api/agendamentos-global/${agendamento.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);

      // Verificar se foi marcado como cancelado no banco
      const agendamentoCancelado = await AgendamentoProcesso.findByPk(agendamento.id);
      expect(agendamentoCancelado.status).toBe('cancelado');
    });
  });

  describe('Listagem Global de Agendamentos', () => {
    beforeEach(async () => {
      // Criar agendamentos de teste
      await AgendamentoProcesso.bulkCreate([
        {
          processo_id: testProcesso.id,
          summary: 'Agendamento 1',
          tipo: 'Reunião',
          start: new Date(Date.now() + 24 * 60 * 60 * 1000),
          end: new Date(Date.now() + 25 * 60 * 60 * 1000),
          status: 'sincronizado'
        },
        {
          processo_id: testProcesso.id,
          summary: 'Agendamento 2',
          tipo: 'Audiência',
          start: new Date(Date.now() + 48 * 60 * 60 * 1000),
          end: new Date(Date.now() + 49 * 60 * 60 * 1000),
          status: 'pendente'
        }
      ]);
    });

    it('deve listar todos os agendamentos com paginação', async () => {
      const response = await request(app)
        .get('/api/agendamentos-global?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('agendamentos');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.agendamentos)).toBeTruthy();
      expect(response.body.data.agendamentos.length).toBeGreaterThan(0);
      expect(response.body.data.pagination).toHaveProperty('total');
      expect(response.body.data.pagination).toHaveProperty('page');
      expect(response.body.data.pagination).toHaveProperty('limit');
    });

    it('deve filtrar agendamentos por status', async () => {
      const response = await request(app)
        .get('/api/agendamentos-global?status=sincronizado')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBeTruthy();
      const agendamentos = response.body.data.agendamentos;
      
      // Todos os agendamentos retornados devem ter status 'sincronizado'
      agendamentos.forEach(agendamento => {
        expect(agendamento.status).toBe('sincronizado');
      });
    });

    it('deve filtrar agendamentos por tipo de evento', async () => {
      const response = await request(app)
  .get('/api/agendamentos-global?tipo=Audiência')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBeTruthy();
      const agendamentos = response.body.data.agendamentos;
      
      // Todos os agendamentos retornados devem ter tipo 'Audiência'
      agendamentos.forEach(agendamento => {
  expect(agendamento.tipo).toBe('Audiência');
      });
    });
  });

  describe('Agendamentos por Processo', () => {
    it('deve listar agendamentos de um processo específico', async () => {
      // Criar agendamento para o processo
      await AgendamentoProcesso.create({
        processo_id: testProcesso.id,
        summary: 'Agendamento do Processo',
  tipo: 'Reunião',
        start: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000),
        status: 'sincronizado'
      });

      const response = await request(app)
        .get(`/api/processos/${testProcesso.id}/agendamentos-processo`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('agendamentos');
      expect(Array.isArray(response.body.data.agendamentos)).toBeTruthy();
      
      // Verificar se todos os agendamentos pertencem ao processo correto
      response.body.data.agendamentos.forEach(agendamento => {
        expect(agendamento.processo_id).toBe(testProcesso.id);
      });
    });
  });

  describe('Validações', () => {
    it('deve retornar erro ao criar agendamento sem processo_id', async () => {
      const agendamentoData = {
        summary: 'Reunião Inválida',
        start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/processos/999999/agendamentos-processo')
        .set('Authorization', `Bearer ${authToken}`)
        .send(agendamentoData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('deve retornar erro ao criar agendamento com data de início no passado', async () => {
      const agendamentoData = {
        summary: 'Reunião no Passado',
        start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Ontem
        end: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post(`/api/processos/${testProcesso.id}/agendamentos-processo`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(agendamentoData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('passado');
    });

    it('deve retornar erro ao criar agendamento com data de fim anterior ao início', async () => {
      const agendamentoData = {
        summary: 'Reunião com Datas Inválidas',
        start: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post(`/api/processos/${testProcesso.id}/agendamentos-processo`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(agendamentoData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('anterior');
    });
  });
});
