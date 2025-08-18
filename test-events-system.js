/**
 * Teste básico do sistema de eventos
 */
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Simular dados de teste
const testUser = {
  email: 'admin@teste.com',
  senha: 'admin123'
};

const testEvent = {
  title: 'Reunião de Teste - Sistema de Eventos',
  description: 'Teste do novo sistema de eventos NPJ',
  start_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
  end_at: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // Amanhã + 1 hora
  participants: [
    { email: 'participante@teste.com' }
  ]
};

async function testarSistemaEventos() {
  console.log('🧪 TESTANDO SISTEMA DE EVENTOS');
  console.log('=' .repeat(50));

  try {
    // 1. Login
    console.log('\n1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testUser);
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');

    const headers = { 'Authorization': `Bearer ${token}` };

    // 2. Criar evento
    console.log('\n2️⃣ Criando solicitação de evento...');
    const createResponse = await axios.post(`${BASE_URL}/api/events`, testEvent, { headers });
    const eventId = createResponse.data.data.id;
    console.log('✅ Evento criado:', createResponse.data.data.title);
    console.log('📧 Status:', createResponse.data.data.status);

    // 3. Listar eventos
    console.log('\n3️⃣ Listando eventos...');
    const listResponse = await axios.get(`${BASE_URL}/api/events`, { headers });
    console.log('✅ Eventos listados:', listResponse.data.data.length);

    // 4. Buscar evento específico
    console.log('\n4️⃣ Buscando evento específico...');
    const getResponse = await axios.get(`${BASE_URL}/api/events/${eventId}`, { headers });
    console.log('✅ Evento encontrado:', getResponse.data.data.title);

    // 5. Aprovar evento (como admin)
    console.log('\n5️⃣ Aprovando evento...');
    const approveResponse = await axios.post(`${BASE_URL}/api/events/${eventId}/approve`, {}, { headers });
    console.log('✅ Evento aprovado:', approveResponse.data.data.status);

    // 6. Obter estatísticas
    console.log('\n6️⃣ Obtendo estatísticas...');
    const statsResponse = await axios.get(`${BASE_URL}/api/events/stats`, { headers });
    console.log('✅ Estatísticas:', statsResponse.data.data);

    console.log('\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO!');
    console.log('✅ Sistema de eventos está funcionando corretamente');

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.error('🔍 Detalhes dos erros:', error.response.data.errors);
    }
  }
}

// Testar sistema de notificações
async function testarNotificacoes() {
  console.log('\n📧 TESTANDO SISTEMA DE NOTIFICAÇÕES');
  console.log('=' .repeat(50));

  try {
    const eventNotificationService = require('./backend/services/eventNotificationService');
    
    // Mock de evento para teste
    const mockEvent = {
      id: 1,
      title: 'Teste de Notificação',
      start_at: new Date(),
      end_at: new Date(Date.now() + 3600000),
      description: 'Teste do sistema de notificações',
      requester: {
        nome: 'Admin Teste',
        email: 'admin@teste.com'
      },
      participants: []
    };

    // Mock de usuário responsável
    const mockResponsible = {
      nome: 'Responsável Teste',
      email: 'responsavel@teste.com'
    };

    console.log('📧 Testando template de solicitação de aprovação...');
    const template = eventNotificationService.getApprovalRequestTemplate(mockEvent, mockResponsible);
    console.log('✅ Template gerado com sucesso');
    console.log('📋 Assunto:', template.subject);

    console.log('\n📧 Testando template de aprovação...');
    const approvedTemplate = eventNotificationService.getApprovedTemplate(mockEvent);
    console.log('✅ Template de aprovação gerado com sucesso');
    console.log('📋 Assunto:', approvedTemplate.subject);

    console.log('\n🎉 SISTEMA DE NOTIFICAÇÕES FUNCIONANDO!');

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE DE NOTIFICAÇÕES:', error.message);
  }
}

// Executar testes
if (require.main === module) {
  console.log('🚀 Aguardando servidor iniciar...');
  setTimeout(async () => {
    await testarSistemaEventos();
    await testarNotificacoes();
  }, 2000);
}

module.exports = { testarSistemaEventos, testarNotificacoes };
