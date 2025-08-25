const request = require('supertest');
const app = require('../../index');

describe('Agendamentos E2E - Fluxo Completo', () => {
  let authToken;
  let processoId = 1;
  let agendamentoId;

  beforeAll(async () => {
    // Setup inicial: autenticação mock
    authToken = 'mock-jwt-token';
  });

  describe('Fluxo Completo: Criar → Listar → Atualizar → Deletar', () => {
    it('deve executar fluxo completo de agendamento', async () => {
      // 1. CRIAR AGENDAMENTO
      console.log('🟡 Testando criação de agendamento...');
      
      const agendamentoData = {
        processo_id: processoId,
        start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        summary: 'E2E Test - Reunião Completa',
  tipo: 'Reunião',
        description: 'Teste end-to-end do sistema',
        location: 'Escritório NPJ - Sala 1',
        attendees: ['participante1@test.com', 'participante2@test.com'],
        reminder_30min: true,
        reminder_1day: true,
        send_confirmation: true
      };

      const createResponse = await request(app)
        .post('/api/agendamentos-processo')
        .set('Authorization', `Bearer ${authToken}`)
        .send(agendamentoData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.agendamento).toBeDefined();
      agendamentoId = createResponse.body.data.agendamento.id;
      
      console.log('✅ Agendamento criado com ID:', agendamentoId);

      // 2. LISTAR AGENDAMENTOS DO PROCESSO
      console.log('🟡 Testando listagem de agendamentos...');
      
      const listResponse = await request(app)
        .get(`/api/processos/${processoId}/agendamentos`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(listResponse.body.success).toBe(true);
      expect(listResponse.body.data.agendamentos).toBeDefined();
      expect(listResponse.body.data.agendamentos.length).toBeGreaterThan(0);
      
      const agendamentoCriado = listResponse.body.data.agendamentos.find(
        ag => ag.id === agendamentoId
      );
      expect(agendamentoCriado).toBeDefined();
      expect(agendamentoCriado.summary).toBe('E2E Test - Reunião Completa');
      
      console.log('✅ Agendamento encontrado na listagem');

      // 3. BUSCAR AGENDAMENTO ESPECÍFICO
      console.log('🟡 Testando busca de agendamento específico...');
      
      const getResponse = await request(app)
        .get(`/api/agendamentos-processo/${agendamentoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.agendamento.id).toBe(agendamentoId);
      expect(getResponse.body.data.agendamento.attendees).toEqual([
        'participante1@test.com', 
        'participante2@test.com'
      ]);
      
      console.log('✅ Agendamento recuperado com todos os dados');

      // 4. ATUALIZAR AGENDAMENTO
      console.log('🟡 Testando atualização de agendamento...');
      
      const updateData = {
        summary: 'E2E Test - Reunião Atualizada',
        location: 'Escritório NPJ - Sala 2',
        attendees: [
          'participante1@test.com', 
          'participante3@test.com', 
          'novo@test.com'
        ],
        description: 'Descrição atualizada via E2E test',
        reminder_15min: true
      };

      const updateResponse = await request(app)
        .put(`/api/agendamentos-processo/${agendamentoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.agendamento.summary).toBe('E2E Test - Reunião Atualizada');
      expect(updateResponse.body.data.agendamento.location).toBe('Escritório NPJ - Sala 2');
      expect(updateResponse.body.data.agendamento.attendees).toHaveLength(3);
      
      console.log('✅ Agendamento atualizado com sucesso');

      // 5. VERIFICAR ATUALIZAÇÃO NA LISTAGEM
      console.log('🟡 Verificando atualização na listagem...');
      
      const listAfterUpdateResponse = await request(app)
        .get(`/api/processos/${processoId}/agendamentos`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const agendamentoAtualizado = listAfterUpdateResponse.body.data.agendamentos.find(
        ag => ag.id === agendamentoId
      );
      expect(agendamentoAtualizado.summary).toBe('E2E Test - Reunião Atualizada');
      
      console.log('✅ Atualização refletida na listagem');

      // 6. CANCELAR/DELETAR AGENDAMENTO
      console.log('🟡 Testando cancelamento de agendamento...');
      
      const deleteResponse = await request(app)
        .delete(`/api/agendamentos-processo/${agendamentoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.data.agendamento.status).toBe('cancelado');
      
      console.log('✅ Agendamento cancelado com sucesso');

      // 7. VERIFICAR QUE NÃO APARECE MAIS EM LISTAGENS ATIVAS
      console.log('🟡 Verificando que não aparece em listagens ativas...');
      
      const listAfterDeleteResponse = await request(app)
        .get(`/api/processos/${processoId}/agendamentos?status=ativo`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const agendamentoCancelado = listAfterDeleteResponse.body.data.agendamentos.find(
        ag => ag.id === agendamentoId
      );
      expect(agendamentoCancelado).toBeUndefined();
      
      console.log('✅ Agendamento cancelado não aparece em listagens ativas');

      // 8. VERIFICAR QUE AINDA EXISTE COM STATUS CANCELADO
      const getAfterDeleteResponse = await request(app)
        .get(`/api/agendamentos-processo/${agendamentoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getAfterDeleteResponse.body.data.agendamento.status).toBe('cancelado');
      
      console.log('✅ Fluxo E2E completo executado com sucesso!');
    });
  });

  describe('Testes de Validação E2E', () => {
    it('deve validar dados de entrada em toda a stack', async () => {
      // Teste dados inválidos
      const dadosInvalidos = {
        // processo_id faltando
        start: 'data-invalida',
        end: new Date(Date.now() - 1000).toISOString(), // No passado
        summary: '', // Vazio
        attendees: 'não-é-array'
      };

      const response = await request(app)
        .post('/api/agendamentos-processo')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dadosInvalidos)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('deve tratar conflitos de horário', async () => {
      // Criar primeiro agendamento
      const horario = new Date(Date.now() + 48 * 60 * 60 * 1000);
      
      const agendamento1 = {
        processo_id: processoId,
        start: horario.toISOString(),
        end: new Date(horario.getTime() + 60 * 60 * 1000).toISOString(),
        summary: 'Primeiro agendamento'
      };

      await request(app)
        .post('/api/agendamentos-processo')
        .set('Authorization', `Bearer ${authToken}`)
        .send(agendamento1)
        .expect(201);

      // Tentar criar conflitante
      const agendamento2 = {
        processo_id: processoId,
        start: new Date(horario.getTime() + 30 * 60 * 1000).toISOString(), // Sobrepõe
        end: new Date(horario.getTime() + 90 * 60 * 1000).toISOString(),
        summary: 'Agendamento conflitante'
      };

      const response = await request(app)
        .post('/api/agendamentos-processo')
        .set('Authorization', `Bearer ${authToken}`)
        .send(agendamento2)
        .expect(400);

      expect(response.body.message).toContain('conflito');
    });
  });

  describe('Integração Google Calendar E2E', () => {
    it('deve simular fluxo completo com Google Calendar', async () => {
      const agendamentoData = {
        processo_id: processoId,
        start: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 73 * 60 * 60 * 1000).toISOString(),
        summary: 'E2E Google Calendar Test',
        location: 'Online - Google Meet',
        attendees: ['attendee@test.com'],
        reminder_30min: true,
        create_google_meet: true
      };

      // Criar com integração Google
      const createResponse = await request(app)
        .post('/api/agendamentos-processo')
        .set('Authorization', `Bearer ${authToken}`)
        .send(agendamentoData)
        .expect(201);

      const agendamento = createResponse.body.data.agendamento;
      
      // Verificar campos do Calendar Local
      if (agendamento.google_event_id) {
        expect(agendamento.html_link).toBeTruthy();
        expect(agendamento.status).toBe('sincronizado');
      } else {
        // Se não sincronizou, deve estar pendente
        expect(agendamento.status).toBe('pendente');
      }

      // Atualizar e verificar sincronização
      const updateResponse = await request(app)
        .put(`/api/agendamentos-processo/${agendamento.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ summary: 'Updated via E2E' })
        .expect(200);

      // Limpar
      await request(app)
        .delete(`/api/agendamentos-processo/${agendamento.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('Performance E2E', () => {
    it('deve listar muitos agendamentos rapidamente', async () => {
      const startTime = Date.now();
      
      // Criar vários agendamentos para teste de performance
      const promises = [];
      for (let i = 0; i < 20; i++) {
        const agendamento = {
          processo_id: processoId,
          start: new Date(Date.now() + (i + 100) * 60 * 60 * 1000).toISOString(),
          end: new Date(Date.now() + (i + 100.5) * 60 * 60 * 1000).toISOString(),
          summary: `Performance Test ${i}`
        };

        promises.push(
          request(app)
            .post('/api/agendamentos-processo')
            .set('Authorization', `Bearer ${authToken}`)
            .send(agendamento)
        );
      }

      await Promise.all(promises);
      
      // Testar listagem
      const listStart = Date.now();
      
      const response = await request(app)
        .get(`/api/processos/${processoId}/agendamentos`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const listTime = Date.now() - listStart;
      
      expect(response.body.data.agendamentos.length).toBeGreaterThanOrEqual(20);
      expect(listTime).toBeLessThan(5000); // Menos de 5 segundos
      
      console.log(`📊 Listagem de ${response.body.data.agendamentos.length} agendamentos levou ${listTime}ms`);
    });
  });
});
