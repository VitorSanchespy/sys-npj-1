const axios = require('axios');

async function testeNotificacoesAutenticacao() {
  console.log('🧪 TESTE ESPECÍFICO DE NOTIFICAÇÕES DE AUTENTICAÇÃO\n');

  try {
    const baseURL = 'http://localhost:3001';

    console.log('1️⃣ Teste de login com email incorreto...');
    try {
      await axios.post(`${baseURL}/auth/login`, {
        email: 'email_teste_notif@inexistente.com',
        senha: '123456'
      });
    } catch (error) {
      console.log('✅ Email incorreto rejeitado');
    }

    console.log('\n2️⃣ Teste de login com senha incorreta...');
    try {
      await axios.post(`${baseURL}/auth/login`, {
        email: 'teste@teste.com',
        senha: 'senha_incorreta_teste'
      });
    } catch (error) {
      console.log('✅ Senha incorreta rejeitada');
    }

    console.log('\n3️⃣ Login bem-sucedido...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'teste@teste.com',
      senha: '123456'
    });

    console.log('✅ Login realizado com sucesso');

    console.log('\n⏳ Aguardando 5 segundos para processamento...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('\n4️⃣ Verificando notificações...');
    const headers = {
      'Authorization': `Bearer ${loginResponse.data.token}`,
      'Content-Type': 'application/json'
    };

    const notificacoesResponse = await axios.get(
      `${baseURL}/api/notificacoes`,
      { headers }
    );

    console.log(`📧 ${notificacoesResponse.data.length} notificações encontradas:`);
    
    notificacoesResponse.data.forEach((notif, index) => {
      console.log(`   ${index + 1}. [${notif.tipo}] ${notif.titulo}`);
      console.log(`      "${notif.mensagem}" - Status: ${notif.status}`);
      console.log(`      Data: ${new Date(notif.criado_em).toLocaleString('pt-BR')}`);
    });

    // Filtrar notificações de login
    const notificacoesLogin = notificacoesResponse.data.filter(n => 
      n.titulo.includes('Login') || n.tipo === 'login_sucesso' || n.tipo === 'senha_incorreta'
    );

    console.log(`\n🔐 ${notificacoesLogin.length} notificações de autenticação encontradas`);

  } catch (error) {
    if (error.response) {
      console.error('❌ Erro na resposta:', error.response.status, error.response.data);
    } else {
      console.error('❌ Erro:', error.message);
    }
  }
}

testeNotificacoesAutenticacao();
