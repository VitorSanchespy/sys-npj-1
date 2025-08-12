/**
 * Script para testar dados válidos para criação de processos e agendamentos
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testarCriacaoProcessos() {
  try {
    // Login como admin
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@teste.com',
      senha: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado');

    // Buscar dados necessários primeiro
    console.log('\n🔍 Buscando dados de referência...');
    
    // Buscar fases disponíveis
    const fasesResponse = await axios.get(`${BASE_URL}/tabelas/fases`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Fases disponíveis:', fasesResponse.data.length);

    // Tentar criar processo com dados mínimos
    console.log('\n📋 Testando criação de processo...');
    const processoData = {
      numero: `PROC-TEST-${Date.now()}`,
      titulo: 'Processo de Teste Automatizado',
      descricao: 'Descrição do processo criado por teste automatizado',
      data_abertura: new Date().toISOString().split('T')[0],
      status: 'Ativo'
    };

    try {
      const processoResponse = await axios.post(`${BASE_URL}/processos`, processoData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Processo criado com sucesso:', processoResponse.data);
    } catch (processoError) {
      console.log('❌ Erro ao criar processo:');
      console.log('Status:', processoError.response?.status);
      console.log('Erro:', processoError.response?.data);
    }

    // Tentar criar agendamento
    console.log('\n📅 Testando criação de agendamento...');
    const agendamentoData = {
      titulo: 'Agendamento de Teste',
      descricao: 'Descrição do agendamento de teste',
      data_hora: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      local: 'Sala de Testes'
    };

    try {
      const agendamentoResponse = await axios.post(`${BASE_URL}/agendamentos`, agendamentoData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Agendamento criado com sucesso:', agendamentoResponse.data);
    } catch (agendamentoError) {
      console.log('❌ Erro ao criar agendamento:');
      console.log('Status:', agendamentoError.response?.status);
      console.log('Erro:', agendamentoError.response?.data);
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testarCriacaoProcessos().catch(console.error);
