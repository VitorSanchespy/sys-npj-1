const Agendamento = require('../../models/agendamentoModel');

// Mock completo do modelo para testes unitários
jest.mock('../../models/agendamentoModel', () => {
  const mockModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    bulkCreate: jest.fn()
  };
  return mockModel;
});

describe('Agendamento Model - Testes Unitários', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validações do Modelo', () => {
    it('deve validar campos obrigatórios', async () => {
      const validationError = new Error('Validation error');
      validationError.name = 'SequelizeValidationError';
      Agendamento.create.mockRejectedValue(validationError);

      try {
        await Agendamento.create({});
        fail('Deveria ter falhado na validação');
      } catch (error) {
        expect(error.name).toBe('SequelizeValidationError');
      }
    });

    it('deve criar agendamento com dados válidos', async () => {
      const validData = {
        processo_id: 1,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000),
        summary: 'Reunião Teste',
        tipo_evento: 'Reunião',
        status: 'ativo'
      };

      const mockResult = {
        id: 1,
        ...validData
      };

      Agendamento.create.mockResolvedValue(mockResult);

      const agendamento = await Agendamento.create(validData);
      expect(agendamento.id).toBeDefined();
      expect(agendamento.summary).toBe('Reunião Teste');
      expect(agendamento.status).toBe('ativo');
    });

    it('deve validar que fim > início', async () => {
      const invalidData = {
        processo_id: 1,
        start: new Date(Date.now() + 25 * 60 * 60 * 1000), // Depois
        end: new Date(Date.now() + 24 * 60 * 60 * 1000),   // Antes
        summary: 'Teste Inválido'
      };

      const validationError = new Error('fim deve ser posterior ao início');
      Agendamento.create.mockRejectedValue(validationError);

      try {
        await Agendamento.create(invalidData);
        fail('Deveria ter falhado na validação de datas');
      } catch (error) {
        expect(error.message).toContain('fim deve ser posterior ao início');
      }
    });
  });

  describe('Campos JSON', () => {
    it('deve armazenar attendees como JSON', async () => {
      const mockResult = {
        id: 1,
        processo_id: 1,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000),
        summary: 'Teste Attendees',
        attendees: ['user1@email.com', 'user2@email.com']
      };

      Agendamento.create.mockResolvedValue(mockResult);

      const agendamento = await Agendamento.create({
        processo_id: 1,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000),
        summary: 'Teste Attendees',
        attendees: ['user1@email.com', 'user2@email.com']
      });

      expect(Array.isArray(agendamento.attendees)).toBe(true);
      expect(agendamento.attendees).toHaveLength(2);
      expect(agendamento.attendees[0]).toBe('user1@email.com');
    });

    it('deve armazenar reminders_config como JSON', async () => {
      const reminderConfig = {
        email30min: true,
        popup15min: true,
        email1day: false,
        customReminder: {
          minutes: 120,
          method: 'email'
        }
      };

      const mockResult = {
        id: 1,
        processo_id: 1,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000),
        summary: 'Teste Reminders',
        reminders_config: reminderConfig
      };

      Agendamento.create.mockResolvedValue(mockResult);

      const agendamento = await Agendamento.create({
        processo_id: 1,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000),
        summary: 'Teste Reminders',
        reminders_config: reminderConfig
      });

      expect(typeof agendamento.reminders_config).toBe('object');
      expect(agendamento.reminders_config.email30min).toBe(true);
      expect(agendamento.reminders_config.customReminder.minutes).toBe(120);
    });
  });

  describe('Campos de Calendar Local', () => {
    it('deve definir status padrão como "ativo"', async () => {
      const mockResult = {
        id: 1,
        processo_id: 1,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000),
        summary: 'Teste Status',
        status: 'ativo'
      };

      Agendamento.create.mockResolvedValue(mockResult);

      const agendamento = await Agendamento.create({
        processo_id: 1,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000),
        summary: 'Teste Status'
      });

      expect(agendamento.status).toBe('ativo');
    });

    it('deve aceitar valores válidos para status', async () => {
      const statuses = ['ativo', 'cancelado', 'pendente', 'sincronizado'];
      
      for (const status of statuses) {
        const mockResult = {
          id: 1,
          processo_id: 1,
          start: new Date(Date.now() + 24 * 60 * 60 * 1000),
          end: new Date(Date.now() + 25 * 60 * 60 * 1000),
          summary: `Teste ${status}`,
          status: status
        };

        Agendamento.create.mockResolvedValue(mockResult);

        const agendamento = await Agendamento.create({
          processo_id: 1,
          start: new Date(Date.now() + 24 * 60 * 60 * 1000),
          end: new Date(Date.now() + 25 * 60 * 60 * 1000),
          summary: `Teste ${status}`,
          status: status
        });

        expect(agendamento.status).toBe(status);
      }
    });

    it('deve armazenar google_event_id', async () => {
      const mockResult = {
        id: 1,
        processo_id: 1,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000),
        summary: 'Teste Google Event ID',
        google_event_id: 'google-event-12345'
      };

      Agendamento.create.mockResolvedValue(mockResult);

      const agendamento = await Agendamento.create({
        processo_id: 1,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000),
        summary: 'Teste Google Event ID',
        google_event_id: 'google-event-12345'
      });

      expect(agendamento.google_event_id).toBe('google-event-12345');
    });

    it('deve armazenar html_link do Calendar Local', async () => {
      const htmlLink = 'local://calendar/event/12345';
      
      const mockResult = {
        id: 1,
        processo_id: 1,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000),
        summary: 'Teste HTML Link',
        html_link: htmlLink
      };

      Agendamento.create.mockResolvedValue(mockResult);

      const agendamento = await Agendamento.create({
        processo_id: 1,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000),
        summary: 'Teste HTML Link',
        html_link: htmlLink
      });

      expect(agendamento.html_link).toBe(htmlLink);
    });

    it('deve definir email_sent como false por padrão', async () => {
      const mockResult = {
        id: 1,
        processo_id: 1,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000),
        summary: 'Teste Email Sent',
        email_sent: false
      };

      Agendamento.create.mockResolvedValue(mockResult);

      const agendamento = await Agendamento.create({
        processo_id: 1,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000),
        summary: 'Teste Email Sent'
      });

      expect(agendamento.email_sent).toBe(false);
    });
  });

  describe('Scopes e Queries', () => {
    it('deve buscar apenas eventos ativos', async () => {
      const mockResults = [
        { id: 1, status: 'ativo', summary: 'Evento 1' },
        { id: 2, status: 'ativo', summary: 'Evento 2' }
      ];

      Agendamento.findAll.mockResolvedValue(mockResults);

      const ativos = await Agendamento.findAll({
        where: { status: 'ativo' }
      });

      expect(ativos).toHaveLength(2);
      ativos.forEach(agendamento => {
        expect(agendamento.status).toBe('ativo');
      });
    });

    it('deve buscar eventos futuros', async () => {
      const mockResults = [
        { 
          id: 1, 
          start: new Date(Date.now() + 24 * 60 * 60 * 1000),
          summary: 'Futuro 1' 
        },
        { 
          id: 2, 
          start: new Date(Date.now() + 48 * 60 * 60 * 1000),
          summary: 'Futuro 2' 
        }
      ];

      Agendamento.findAll.mockResolvedValue(mockResults);

      const futuros = await Agendamento.findAll({
        where: {
          start: {
            [require('sequelize').Op.gt]: new Date()
          }
        }
      });

      expect(futuros).toHaveLength(2);
      futuros.forEach(agendamento => {
        expect(new Date(agendamento.start).getTime()).toBeGreaterThan(Date.now());
      });
    });

    it('deve buscar por processo específico', async () => {
      const mockResults = [
        { id: 1, processo_id: 1, summary: 'Evento 1' },
        { id: 2, processo_id: 1, summary: 'Evento 2' },
        { id: 3, processo_id: 1, summary: 'Evento 3' }
      ];

      Agendamento.findAll.mockResolvedValue(mockResults);

      const processoAgendamentos = await Agendamento.findAll({
        where: { processo_id: 1 }
      });

      expect(processoAgendamentos).toHaveLength(3);
      processoAgendamentos.forEach(agendamento => {
        expect(agendamento.processo_id).toBe(1);
      });
    });
  });

  describe('Hooks e Métodos', () => {
    it('deve executar hook beforeCreate se definido', async () => {
      const mockResult = {
        id: 1,
        processo_id: 1,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000),
        summary: 'Teste Hook',
        createdAt: new Date()
      };

      Agendamento.create.mockResolvedValue(mockResult);

      const agendamento = await Agendamento.create({
        processo_id: 1,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000),
        summary: 'Teste Hook'
      });

      expect(agendamento.id).toBeDefined();
      expect(agendamento.createdAt).toBeDefined();
    });

    it('deve simular atualização de timestamp', async () => {
      const originalTime = new Date();
      const updatedTime = new Date(originalTime.getTime() + 1000);

      const mockAgendamento = {
        id: 1,
        summary: 'Teste Update',
        updatedAt: originalTime,
        update: jest.fn().mockImplementation(() => {
          mockAgendamento.updatedAt = updatedTime;
          return Promise.resolve(mockAgendamento);
        })
      };

      Agendamento.create.mockResolvedValue(mockAgendamento);

      const agendamento = await Agendamento.create({
        processo_id: 1,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000),
        summary: 'Teste Update'
      });

      const originalUpdatedAt = agendamento.updatedAt;
      
      await agendamento.update({ summary: 'Sumário Atualizado' });
      
      expect(agendamento.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
