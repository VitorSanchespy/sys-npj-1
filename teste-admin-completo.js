const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Configuração para usuário Admin
const adminLogin = {
  email: 'admin@npj.com',
  senha: 'admin123'
};

async function testeAdminCompleto() {
  console.log('🔍 TESTE COMPLETO COM USUÁRIO ADMIN');
  console.log('===================================');
  
  try {
    // 1. Login como Admin
    console.log('1️⃣ Fazendo login como Admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, adminLogin);
    const token = loginResponse.data.token;
    console.log('✅ Login Admin realizado com sucesso!');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Testar criação de processo como Admin
    console.log('\n2️⃣ Testando criação de processo como Admin...');
    const processoPayload = {
      numero_processo: `ADMIN-TEST-${Date.now()}`,
      titulo: 'Processo de teste criado por Admin',
      descricao: 'Teste de criação de processo com usuário Admin',
      tipo_processo: 'Civil',
      status: 'Em andamento',
      assistido: 'Cliente Admin Teste',
      contato_assistido: 'admin@teste.com, (11) 88888-8888',
      responsavel_nome: 'Admin Responsável',
      responsavel_email: 'admin@npj.com'
    };

    try {
      const processoResponse = await axios.post(`${BASE_URL}/processos`, processoPayload, { headers });
      console.log('✅ Processo criado com sucesso pelo Admin!');
      console.log('📄 ID do processo:', processoResponse.data.id);
    } catch (processoError) {
      console.log('❌ Erro na criação do processo:');
      console.log('📥 Status:', processoError.response?.status);
      console.log('📥 Erro:', JSON.stringify(processoError.response?.data, null, 2));
    }

    // 3. Testar agendamento local (bypass Google Calendar)
    console.log('\n3️⃣ Testando agendamento local...');
    const agendamentoPayload = {
      titulo: `Admin Agendamento Local - ${Date.now()}`,
      descricao: 'Agendamento de teste criado por Admin usando bypass local',
      data_inicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // +1 dia
      data_fim: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // +1 dia +1 hora
      local: 'Sala Admin Teste',
      tipo: 'reuniao'
    };

    try {
      const agendamentoResponse = await axios.post(`${BASE_URL}/agendamentos-local`, agendamentoPayload, { headers });
      console.log('✅ Agendamento local criado com sucesso!');
      console.log('📅 ID do agendamento:', agendamentoResponse.data.id);
    } catch (agendamentoError) {
      console.log('❌ Erro na criação do agendamento local:');
      console.log('📥 Status:', agendamentoError.response?.status);
      console.log('📥 Erro:', JSON.stringify(agendamentoError.response?.data, null, 2));
    }

    // 4. Testar atualização de perfil Admin
    console.log('\n4️⃣ Testando atualização de perfil Admin...');
    const perfilPayload = {
      nome: 'Admin NPJ - Teste Completo',
      telefone: '(11) 77777-7777'
    };

    try {
      const perfilResponse = await axios.put(`${BASE_URL}/usuarios/me`, perfilPayload, { headers });
      console.log('✅ Perfil Admin atualizado com sucesso!');
      console.log('👤 Nome:', perfilResponse.data.nome);
    } catch (perfilError) {
      console.log('❌ Erro na atualização do perfil:');
      console.log('📥 Status:', perfilError.response?.status);
      console.log('📥 Erro:', JSON.stringify(perfilError.response?.data, null, 2));
    }

    // 5. Testar exportação PDF
    console.log('\n5️⃣ Testando exportação PDF...');
    try {
      const pdfResponse = await axios.get(`${BASE_URL}/dashboard/exportar`, { 
        headers,
        responseType: 'arraybuffer'
      });
      
      console.log('✅ PDF gerado com sucesso!');
      console.log('📄 Content-Type:', pdfResponse.headers['content-type']);
      console.log('📄 Tamanho:', pdfResponse.data.length, 'bytes');
      
      // Salvar PDF para verificação
      const fs = require('fs');
      fs.writeFileSync('teste-admin-relatorio.pdf', pdfResponse.data);
      console.log('💾 PDF salvo como "teste-admin-relatorio.pdf"');
      
    } catch (pdfError) {
      console.log('❌ Erro na exportação PDF:');
      console.log('📥 Status:', pdfError.response?.status);
      console.log('📥 Erro:', pdfError.message);
    }

    // 6. Testar dados do dashboard
    console.log('\n6️⃣ Testando dados do dashboard...');
    try {
      const dashboardResponse = await axios.get(`${BASE_URL}/dashboard`, { headers });
      console.log('✅ Dashboard acessado com sucesso!');
      console.log('📊 Dados:', JSON.stringify(dashboardResponse.data, null, 2));
    } catch (dashboardError) {
      console.log('❌ Erro no dashboard:');
      console.log('📥 Status:', dashboardError.response?.status);
      console.log('📥 Erro:', JSON.stringify(dashboardError.response?.data, null, 2));
    }

    console.log('\n🎯 TESTE ADMIN COMPLETO FINALIZADO!');
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error.message);
  }
}

testeAdminCompleto();
