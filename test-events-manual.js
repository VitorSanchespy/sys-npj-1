/**
 * Teste manual das rotas do sistema de eventos
 */

async function testeEventos() {
  console.log('🧪 TESTE MANUAL DO SISTEMA DE EVENTOS');
  console.log('=' .repeat(50));

  try {
    const baseUrl = 'http://localhost:3001';
    
    // 1. Login
    console.log('\n1️⃣ Fazendo login...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@teste.com',
        senha: 'admin123'
      })
    });
    
    if (!loginRes.ok) {
      console.error('❌ Erro no login:', loginRes.status);
      return;
    }
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('✅ Login realizado com sucesso');
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 2. Criar evento
    console.log('\n2️⃣ Criando evento...');
    const eventData = {
      title: 'Evento de Teste - Sistema NPJ',
      description: 'Teste do novo sistema de eventos',
      start_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      end_at: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
      participants: [{ email: 'teste@participante.com' }]
    };
    
    const createRes = await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify(eventData)
    });
    
    if (!createRes.ok) {
      console.error('❌ Erro ao criar evento:', createRes.status);
      const errorData = await createRes.text();
      console.error('📋 Detalhes:', errorData);
      return;
    }
    
    const createData = await createRes.json();
    const eventId = createData.data.id;
    console.log('✅ Evento criado:', createData.data.title);
    console.log('📧 Status:', createData.data.status);
    console.log('🆔 ID:', eventId);

    // 3. Listar eventos
    console.log('\n3️⃣ Listando eventos...');
    const listRes = await fetch(`${baseUrl}/api/events`, { headers });
    
    if (!listRes.ok) {
      console.error('❌ Erro ao listar eventos:', listRes.status);
      return;
    }
    
    const listData = await listRes.json();
    console.log('✅ Eventos encontrados:', listData.data.length);

    // 4. Buscar evento específico
    console.log('\n4️⃣ Buscando evento específico...');
    const getRes = await fetch(`${baseUrl}/api/events/${eventId}`, { headers });
    
    if (!getRes.ok) {
      console.error('❌ Erro ao buscar evento:', getRes.status);
      return;
    }
    
    const getData = await getRes.json();
    console.log('✅ Evento encontrado:', getData.data.title);

    // 5. Aprovar evento
    console.log('\n5️⃣ Aprovando evento...');
    const approveRes = await fetch(`${baseUrl}/api/events/${eventId}/approve`, {
      method: 'POST',
      headers
    });
    
    if (!approveRes.ok) {
      console.error('❌ Erro ao aprovar evento:', approveRes.status);
      return;
    }
    
    const approveData = await approveRes.json();
    console.log('✅ Evento aprovado:', approveData.data.status);

    // 6. Estatísticas
    console.log('\n6️⃣ Obtendo estatísticas...');
    const statsRes = await fetch(`${baseUrl}/api/events/stats`, { headers });
    
    if (!statsRes.ok) {
      console.error('❌ Erro ao obter estatísticas:', statsRes.status);
      return;
    }
    
    const statsData = await statsRes.json();
    console.log('✅ Estatísticas:', JSON.stringify(statsData.data, null, 2));

    console.log('\n🎉 TODOS OS TESTES FORAM EXECUTADOS COM SUCESSO!');
    console.log('✅ Sistema de eventos está funcionando corretamente');

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
  }
}

testeEventos();
