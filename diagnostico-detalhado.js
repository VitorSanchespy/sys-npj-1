#!/usr/bin/env node

/**
 * DIAGNÓSTICO DETALHADO DE ERROS - SISTEMA NPJ
 * Captura detalhes específicos dos erros de validação
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function diagnosticoDetalhado() {
  console.log('🔍 DIAGNÓSTICO DETALHADO DE ERROS');
  console.log('=================================');

  // Fazer login do professor
  const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: 'professor@npj.com',
    senha: '123456'
  });

  const token = loginResponse.data.token;
  console.log('✅ Token obtido para testes');

  // 1. TESTE CRIAÇÃO DE PROCESSO (detalhado)
  console.log('\n📋 ERRO 1: CRIAÇÃO DE PROCESSO');
  console.log('==============================');

  try {
    const novoProcesso = {
      numero_processo: `TEST-${Date.now()}`,
      titulo: 'Processo de teste para diagnóstico detalhado', // Campo obrigatório
      descricao: 'Processo de teste para diagnóstico detalhado',
      tipo_processo: 'Civil',
      status: 'Em andamento',
      assistido: 'Cliente Teste Detalhado', // Nome do assistido
      contato_assistido: 'cliente@teste.com, (11) 99999-9999', // Campo obrigatório
      responsavel_nome: 'Responsável Teste',
      responsavel_email: 'responsavel@teste.com'
    };

    console.log('📤 Payload enviado:');
    console.log(JSON.stringify(novoProcesso, null, 2));

    const response = await axios.post(`${BASE_URL}/api/processos`, novoProcesso, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Processo criado com sucesso!');
    console.log('📥 Resposta:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Erro na criação do processo:');
    console.log('📥 Status:', error.response?.status);
    console.log('📥 Erro:', JSON.stringify(error.response?.data, null, 2));
    console.log('📥 Headers:', JSON.stringify(error.response?.headers, null, 2));
  }

  // 2. TESTE CRIAÇÃO DE AGENDAMENTO (detalhado)
  console.log('\n📅 ERRO 2: CRIAÇÃO DE AGENDAMENTO');
  console.log('=================================');

  try {
    const novoAgendamento = {
      titulo: `Teste Agendamento Detalhado - ${Date.now()}`,
      descricao: 'Agendamento de teste para diagnóstico detalhado',
      data_inicio: new Date(Date.now() + 86400000).toISOString(), // Amanhã
      data_fim: new Date(Date.now() + 86400000 + 3600000).toISOString(), // Amanhã + 1h
      local: 'Sala de testes detalhados',
      tipo: 'reuniao'
    };

    console.log('📤 Payload enviado:');
    console.log(JSON.stringify(novoAgendamento, null, 2));

    const response = await axios.post(`${BASE_URL}/api/agendamentos`, novoAgendamento, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Agendamento criado com sucesso!');
    console.log('📥 Resposta:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Erro na criação do agendamento:');
    console.log('📥 Status:', error.response?.status);
    console.log('📥 Erro:', JSON.stringify(error.response?.data, null, 2));
    console.log('📥 Headers:', JSON.stringify(error.response?.headers, null, 2));
  }

  // 3. TESTE ATUALIZAÇÃO DE PERFIL (detalhado)
  console.log('\n👤 ERRO 3: ATUALIZAÇÃO DE PERFIL');
  console.log('=================================');

  try {
    const updateData = {
      nome: 'Professor NPJ - Atualizado Detalhado',
      telefone: '(11) 99999-8888'
    };

    console.log('📤 Payload enviado:');
    console.log(JSON.stringify(updateData, null, 2));

    const response = await axios.put(`${BASE_URL}/api/usuarios/me`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Perfil atualizado com sucesso!');
    console.log('📥 Resposta:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Erro na atualização do perfil:');
    console.log('📥 Status:', error.response?.status);
    console.log('📥 Erro:', JSON.stringify(error.response?.data, null, 2));
    console.log('📥 Headers:', JSON.stringify(error.response?.headers, null, 2));
  }

  // 4. TESTE EXPORTAÇÃO PDF (detalhado)
  console.log('\n📄 ERRO 4: EXPORTAÇÃO PDF');
  console.log('==========================');

  try {
    const response = await axios.get(`${BASE_URL}/api/dashboard/exportar`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'arraybuffer'
    });

    console.log('📥 Status:', response.status);
    console.log('📥 Content-Type:', response.headers['content-type']);
    console.log('📥 Content-Length:', response.headers['content-length']);
    console.log('📥 Tamanho do arquivo:', response.data.length);

    if (response.headers['content-type']?.includes('pdf')) {
      console.log('✅ PDF retornado corretamente!');
    } else {
      console.log('❌ Resposta não é PDF:');
      // Converter buffer para string se for JSON
      const responseText = Buffer.from(response.data).toString('utf8');
      console.log('📥 Conteúdo:', responseText.substring(0, 500));
    }

  } catch (error) {
    console.log('❌ Erro na exportação PDF:');
    console.log('📥 Status:', error.response?.status);
    console.log('📥 Erro:', JSON.stringify(error.response?.data, null, 2));
  }

  console.log('\n🎯 DIAGNÓSTICO DETALHADO CONCLUÍDO!');
}

// Executar
diagnosticoDetalhado().catch(console.error);
