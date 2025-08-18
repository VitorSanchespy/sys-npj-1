/**
 * Teste simples das rotas do sistema de eventos
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
    // Verificar se servidor está rodando
    console.log('\n🔍 Verificando servidor...');
    const statusResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Servidor está rodando:', statusResponse.data.message);

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

    return true;
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.error('🔍 Detalhes dos erros:', error.response.data.errors);
    }
    return false;
  }
}

// Executar teste
testarSistemaEventos();
