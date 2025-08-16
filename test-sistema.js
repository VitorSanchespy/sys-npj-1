// Script para testar o sistema de agendamentos e emails
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testLogin() {
  try {
    console.log('🔑 Testando login...');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@npj.com',
      senha: 'admin123'
    });
    
    if (response.data.success) {
      console.log('✅ Login realizado com sucesso');
      return response.data.token;
    } else {
      console.log('❌ Falha no login:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Erro no login:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testAgendamento(token) {
  try {
    console.log('📅 Testando criação de agendamento...');
    
    const agendamento = {
      titulo: 'Reunião de Teste',
      descricao: 'Teste do sistema de agendamentos',
      data_inicio: new Date(Date.now() + 3600000).toISOString(), // +1 hora
      data_fim: new Date(Date.now() + 7200000).toISOString(), // +2 horas
      local: 'Sala Virtual',
      tipo: 'reuniao',
      processo_id: 1,
      convidados: [
        { email: 'teste@exemplo.com', nome: 'Convidado Teste' }
      ]
    };
    
    const response = await axios.post(`${BASE_URL}/api/agendamentos`, agendamento, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      console.log('✅ Agendamento criado com sucesso');
      return response.data.data.id;
    } else {
      console.log('❌ Falha na criação:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Erro na criação:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testLembrete(token, agendamentoId) {
  try {
    console.log('📧 Testando envio de lembrete...');
    
    const response = await axios.post(`${BASE_URL}/api/agendamentos/${agendamentoId}/lembrete`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      console.log('✅ Lembrete enviado com sucesso');
      return true;
    } else {
      console.log('❌ Falha no envio:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro no envio:', error.response?.data?.message || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes do sistema...\n');
  
  const token = await testLogin();
  if (!token) {
    console.log('❌ Não foi possível obter token, parando testes');
    return;
  }
  
  console.log('');
  const agendamentoId = await testAgendamento(token);
  if (!agendamentoId) {
    console.log('❌ Não foi possível criar agendamento, parando testes');
    return;
  }
  
  console.log('');
  await testLembrete(token, agendamentoId);
  
  console.log('\n🎯 Testes concluídos!');
}

runTests();
