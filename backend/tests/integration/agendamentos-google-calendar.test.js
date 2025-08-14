const request = require('supertest');
const app = require('../../index');
const AgendamentoProcesso = require('../../models/agendamentoProcessoModel');
const calendarService = require('../../services/calendarService');
const notificationService = require('../../services/enhancedNotificationService');

// Mock dos serviços externos
jest.mock('../../services/calendarService');
jest.mock('../../services/enhancedNotificationService');

describe('Agendamentos com Google Calendar - Integração Completa', () => {
  let authToken;
  let processoId = 1;

  beforeAll(async () => {
    // Mock do usuário autenticado
    authToken = 'mock-jwt-token';
  });

  beforeEach(() => {
    // Reset dos mocks
    jest.clearAllMocks();
    
    // Mock do calendarService
    calendarService.isAvailable.mockReturnValue(true);
    calendarService.createEvent.mockResolvedValue({
      success: true,
      eventId: 'google-event-123',
      htmlLink: 'https://calendar.google.com/event/123'
    });
    calendarService.updateEvent.mockResolvedValue({
      success: true,
      eventId: 'google-event-123',
      htmlLink: 'https://calendar.google.com/event/123'
    });
    calendarService.deleteEvent.mockResolvedValue({
      success: true
    });
    calendarService.listEvents.mockResolvedValue({
      success: true,
      events: []
    });

    // Mock do notificationService
    notificationService.isConfigured.mockReturnValue(true);
    notificationService.sendCustomNotification.mockResolvedValue(true);
  });

  afterEach(async () => {
    // Limpar dados de teste
    await AgendamentoProcesso.destroy({ where: {}, force: true });
  });

  describe('POST /api/agendamentos-processo', () => {
    it('deve criar agendamento com sincronização Google Calendar', async () => {
      const agendamentoData = {
        processo_id: processoId,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
        end: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        summary: 'Reunião de teste',
        tipo_evento: 'Reunião',
        description: 'Descrição da reunião',
        location: 'Escritório NPJ',
        attendees: ['participante@email.com'],
        reminder_30min: true,
        reminder_1day: true,
        send_confirmation: true
      };

      const response = await request(app)
        .post('/api/agendamentos-processo')
        .set('Authorization', `Bearer ${authToken}`)
        .send(agendamentoData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.agendamento.google_event_id).toBe('google-event-123');
      expect(response.body.data.agendamento.status).toBe('sincronizado');
      expect(response.body.data.agendamento.html_link).toBe('https://calendar.google.com/event/123');

      // Verificar se o Google Calendar foi chamado corretamente
      expect(calendarService.createEvent).toHaveBeenCalledWith({
        start: expect.any(Date),
        end: expect.any(Date),
        summary: 'Reunião de teste',
        description: expect.stringContaining('Processo: 1'),
        location: 'Escritório NPJ',
        attendees: ['participante@email.com'],
        reminders: {
          email30min: true,
          popup15min: true,
          email1day: true
        }
      });

      // Verificar se a notificação foi enviada
      expect(notificationService.sendCustomNotification).toHaveBeenCalled();
    });

    it('deve validar dados obrigatórios', async () => {
      const response = await request(app)
        .post('/api/agendamentos-processo')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('obrigatórios');
    });

    it('deve validar horário de início < fim', async () => {
      const agendamentoData = {
        processo_id: processoId,
        start: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // Depois
        end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),   // Antes
        summary: 'Teste inválido'
      };

      const response = await request(app)
        .post('/api/agendamentos-processo')
        .set('Authorization', `Bearer ${authToken}`)
        .send(agendamentoData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('início deve ser anterior');
    });

    it('deve criar agendamento mesmo com falha no Google Calendar', async () => {
      // Mock de falha no Google Calendar
      calendarService.createEvent.mockResolvedValue({
        success: false,
        error: 'API Error'
      });

      const agendamentoData = {
        processo_id: processoId,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        summary: 'Reunião de teste'
      };

      const response = await request(app)
        .post('/api/agendamentos-processo')
        .set('Authorization', `Bearer ${authToken}`)
        .send(agendamentoData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.agendamento.status).toBe('pendente');
      expect(response.body.data.agendamento.google_event_id).toBeNull();
    });
  });

  describe('PUT /api/agendamentos-processo/:id', () => {
    let agendamentoId;

    beforeEach(async () => {
      // Criar agendamento para teste
      const agendamento = await AgendamentoProcesso.create({
        processo_id: processoId,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000),
        summary: 'Reunião original',
        google_event_id: 'google-event-123',
        status: 'sincronizado'
      });
      agendamentoId = agendamento.id;
    });

    it('deve atualizar agendamento e sincronizar com Google Calendar', async () => {
      const updateData = {
        summary: 'Reunião atualizada',
        location: 'Novo local',
        attendees: ['novo@email.com', 'participante2@email.com'],
        reminder_15min: true
      };

      const response = await request(app)
        .put(`/api/agendamentos-processo/${agendamentoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.agendamento.summary).toBe('Reunião atualizada');

      // Verificar se o Google Calendar foi atualizado
      expect(calendarService.updateEvent).toHaveBeenCalledWith(
        'google-event-123',
        expect.objectContaining({
          summary: 'Reunião atualizada',
          location: 'Novo local',
          attendees: ['novo@email.com', 'participante2@email.com'],
          reminders: expect.objectContaining({
            popup15min: true
          })
        })
      );
    });
  });

  describe('DELETE /api/agendamentos-processo/:id', () => {
    let agendamentoId;

    beforeEach(async () => {
      const agendamento = await AgendamentoProcesso.create({
        processo_id: processoId,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000),
        summary: 'Reunião para deletar',
        google_event_id: 'google-event-123',
        status: 'sincronizado'
      });
      agendamentoId = agendamento.id;
    });

    it('deve cancelar agendamento e remover do Google Calendar', async () => {
      const response = await request(app)
        .delete(`/api/agendamentos-processo/${agendamentoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.agendamento.status).toBe('cancelado');

      // Verificar se foi removido do Google Calendar
      expect(calendarService.deleteEvent).toHaveBeenCalledWith('google-event-123');
    });
  });

  describe('GET /api/processos/:processoId/agendamentos', () => {
    beforeEach(async () => {
      // Criar alguns agendamentos para teste
      await AgendamentoProcesso.bulkCreate([
        {
          processo_id: processoId,
          start: new Date(Date.now() + 24 * 60 * 60 * 1000),
          end: new Date(Date.now() + 25 * 60 * 60 * 1000),
          summary: 'Reunião 1',
          status: 'sincronizado'
        },
        {
          processo_id: processoId,
          start: new Date(Date.now() + 48 * 60 * 60 * 1000),
          end: new Date(Date.now() + 49 * 60 * 60 * 1000),
          summary: 'Reunião 2',
          status: 'pendente'
        }
      ]);

      // Mock eventos do Google Calendar
      calendarService.listEvents.mockResolvedValue({
        success: true,
        events: [
          {
            id: 'google-only-event',
            summary: 'Evento só no Google',
            start: { dateTime: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() },
            end: { dateTime: new Date(Date.now() + 73 * 60 * 60 * 1000).toISOString() },
            htmlLink: 'https://calendar.google.com/event/456'
          }
        ]
      });
    });

    it('deve listar agendamentos do processo incluindo Google Calendar', async () => {
      const response = await request(app)
        .get(`/api/processos/${processoId}/agendamentos`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.agendamentos).toHaveLength(3); // 2 locais + 1 Google
      expect(response.body.data.total).toBe(3);

      // Verificar se eventos estão ordenados por data
      const eventos = response.body.data.agendamentos;
      for (let i = 1; i < eventos.length; i++) {
        expect(new Date(eventos[i-1].start).getTime()).toBeLessThanOrEqual(
          new Date(eventos[i].start).getTime()
        );
      }
    });
  });

  describe('Notificações por E-mail', () => {
    it('deve configurar notificação automática ao criar agendamento', async () => {
      const agendamentoData = {
        processo_id: processoId,
        start: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hora no futuro
        end: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
        summary: 'Reunião com notificação',
        send_confirmation: true
      };

      await request(app)
        .post('/api/agendamentos-processo')
        .set('Authorization', `Bearer ${authToken}`)
        .send(agendamentoData)
        .expect(201);

      // Verificar se a notificação foi configurada
      expect(notificationService.sendCustomNotification).toHaveBeenCalledWith(
        expect.anything(),
        'confirmation'
      );
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve tratar erro de conexão com Google Calendar graciosamente', async () => {
      calendarService.createEvent.mockRejectedValue(new Error('Network error'));

      const agendamentoData = {
        processo_id: processoId,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        summary: 'Teste erro rede'
      };

      const response = await request(app)
        .post('/api/agendamentos-processo')
        .set('Authorization', `Bearer ${authToken}`)
        .send(agendamentoData)
        .expect(201);

      // Deve criar o agendamento mesmo com erro
      expect(response.body.success).toBe(true);
      expect(response.body.data.agendamento.status).toBe('pendente');
    });

    it('deve retornar erro 404 para agendamento inexistente', async () => {
      const response = await request(app)
        .get('/api/agendamentos-processo/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('não encontrado');
    });
  });
});
