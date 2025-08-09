const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

// Configuração de teste
const config = {
  usuario: {
    email: 'admin@teste.com',
    senha: 'admin123'
  }
};

let authToken = '';

// Log de teste
function logTeste(emoji, mensagem, sucesso = true) {
  const status = sucesso ? '✅' : '❌';
  console.log(`${status} ${emoji} ${mensagem}`);
}

// Teste de login
async function testeLogin() {
  try {
    console.log('\n🔐 Testando autenticação...');
    
    const response = await axios.post(`${baseURL}/auth/login`, config.usuario);
    
    if (response.data.token) {
      authToken = response.data.token;
      logTeste('🔑', 'Login realizado com sucesso');
      return true;
    } else {
      logTeste('❌', 'Token não encontrado na resposta', false);
      return false;
    }
  } catch (error) {
    logTeste('❌', `Erro no login: ${error.response?.data?.erro || error.message}`, false);
    return false;
  }
}

// Teste do sistema de notificações
async function testeNotificacoes() {
  try {
    console.log('\n📬 Testando sistema de notificações...');
    
    const headers = { Authorization: `Bearer ${authToken}` };
    
    // 1. Testar listagem de notificações
    console.log('\n📋 Testando listagem de notificações...');
    const responseList = await axios.get(`${baseURL}/notificacoes`, { headers });
    logTeste('📋', `Listagem retornou ${responseList.data.length} notificações`);
    
    // 2. Testar contagem de não lidas
    console.log('\n🔢 Testando contagem de não lidas...');
    const responseCount = await axios.get(`${baseURL}/notificacoes/nao-lidas/count`, { headers });
    logTeste('🔢', `Contagem de não lidas: ${responseCount.data.count}`);
    
    // 3. Testar criação de notificação
    console.log('\n✨ Testando criação de notificação...');
    const novaNotificacao = {
      titulo: 'Teste Sistema',
      mensagem: 'Notificação de teste do sistema',
      tipo: 'sistema',
      usuario_id: 1
    };
    
    try {
      const responseCreate = await axios.post(`${baseURL}/notificacoes`, novaNotificacao, { headers });
      logTeste('✨', 'Notificação criada com sucesso');
      
      // 4. Testar marcação como lida
      const notificacaoId = responseCreate.data.id;
      if (notificacaoId) {
        console.log('\n✓ Testando marcação como lida...');
        await axios.put(`${baseURL}/notificacoes/${notificacaoId}/lida`, {}, { headers });
        logTeste('✓', 'Notificação marcada como lida');
      }
    } catch (createError) {
      logTeste('❌', `Erro ao criar notificação: ${createError.response?.data?.erro || createError.message}`, false);
    }
    
    // 5. Testar configurações
    console.log('\n⚙️ Testando configurações...');
    try {
      const responseConfig = await axios.get(`${baseURL}/notificacoes/configuracoes`, { headers });
      logTeste('⚙️', 'Configurações carregadas com sucesso');
    } catch (configError) {
      logTeste('❌', `Erro nas configurações: ${configError.response?.data?.erro || configError.message}`, false);
    }
    
    return true;
  } catch (error) {
    logTeste('❌', `Erro geral no teste de notificações: ${error.response?.data?.erro || error.message}`, false);
    return false;
  }
}

// Função principal de teste
async function executarTestes() {
  console.log('🎯 TESTE DO SISTEMA DE NOTIFICAÇÕES NPJ');
  console.log('=' .repeat(50));
  
  try {
    // 1. Teste de login
    const loginOk = await testeLogin();
    if (!loginOk) {
      console.log('\n❌ Falha no login - interrompendo testes');
      return;
    }
    
    // 2. Teste do sistema de notificações
    await testeNotificacoes();
    
    console.log('\n🎯 TESTES CONCLUÍDOS!');
    
  } catch (error) {
    console.error('\n❌ Erro geral:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  executarTestes().catch(console.error);
}

module.exports = { executarTestes };
