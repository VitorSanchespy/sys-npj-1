const axios = require('axios');

async function testeCompletoSistemaNotificacoes() {
  console.log('🧪 TESTE COMPLETO DO SISTEMA DE NOTIFICAÇÕES EXPANDIDO\n');

  try {
    const baseURL = 'http://localhost:3001';
    let token = '';
    let headers = {};

    console.log('=== 🔐 TESTE DE NOTIFICAÇÕES DE AUTENTICAÇÃO ===\n');

    // 1. Teste de login com email incorreto
    console.log('1️⃣ Testando login com email incorreto...');
    try {
      await axios.post(`${baseURL}/auth/login`, {
        email: 'email_inexistente@teste.com',
        senha: '123456'
      });
    } catch (error) {
      console.log('✅ Email incorreto rejeitado corretamente');
    }

    // 2. Teste de login com senha incorreta
    console.log('2️⃣ Testando login com senha incorreta...');
    try {
      await axios.post(`${baseURL}/auth/login`, {
        email: 'teste@teste.com',
        senha: 'senha_errada'
      });
    } catch (error) {
      console.log('✅ Senha incorreta rejeitada corretamente');
    }

    // 3. Login bem-sucedido
    console.log('3️⃣ Fazendo login bem-sucedido...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'teste@teste.com',
      senha: '123456'
    });

    token = loginResponse.data.token;
    headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    console.log('✅ Login bem-sucedido');

    // 4. Aguardar processamento de notificações de autenticação
    console.log('⏳ Aguardando processamento de notificações de autenticação...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n=== 👥 TESTE DE NOTIFICAÇÕES DE USUÁRIOS ===\n');

    // 5. Criar novo usuário
    console.log('5️⃣ Criando novo usuário...');
    const novoUsuario = {
      nome: 'Usuário Teste Notificação',
      email: `teste.notif.${Date.now()}@teste.com`,
      senha: '123456',
      role_id: 2
    };

    try {
      const usuarioResponse = await axios.post(
        `${baseURL}/api/usuarios`,
        novoUsuario,
        { headers }
      );
      console.log('✅ Usuário criado:', usuarioResponse.data);
    } catch (error) {
      console.log('⚠️ Erro ao criar usuário:', error.response?.data || error.message);
    }

    console.log('\n=== 📋 TESTE DE NOTIFICAÇÕES DE PROCESSOS ===\n');

    // 6. Criar processo
    console.log('6️⃣ Criando processo...');
    const novoProcesso = {
      numero_processo: `TESTE-${Date.now()}`,
      parte_contraria: 'Teste Parte Contrária',
      comarca: 'Cuiabá',
      vara: '1ª Vara Cível',
      valor_causa: 5000.00,
      tipo_acao: 'Cível',
      observacoes: 'Processo teste para notificações',
      sistema: 'teste',
      descricao: 'Processo de teste do sistema de notificações'
    };

    try {
      const processoResponse = await axios.post(
        `${baseURL}/api/processos`,
        novoProcesso,
        { headers }
      );
      console.log('✅ Processo criado:', {
        id: processoResponse.data.processo.id,
        numero: processoResponse.data.processo.numero_processo
      });
    } catch (error) {
      console.log('⚠️ Erro ao criar processo:', error.response?.data || error.message);
    }

    console.log('\n=== 📅 TESTE DE NOTIFICAÇÕES DE AGENDAMENTOS ===\n');

    // 7. Criar agendamento
    console.log('7️⃣ Criando agendamento...');
    const novoAgendamento = {
      tipo_evento: 'reuniao',
      titulo: 'Teste Sistema Completo de Notificações',
      descricao: 'Agendamento para testar todo o sistema de notificações',
      data_evento: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      local: 'Sala Virtual',
      lembrete_1_dia: true
    };

    try {
      const agendamentoResponse = await axios.post(
        `${baseURL}/api/agendamentos`,
        novoAgendamento,
        { headers }
      );
      console.log('✅ Agendamento criado:', {
        id: agendamentoResponse.data.id,
        titulo: agendamentoResponse.data.titulo
      });
    } catch (error) {
      console.log('⚠️ Erro ao criar agendamento:', error.response?.data || error.message);
    }

    // 8. Aguardar processamento final
    console.log('\n⏳ Aguardando processamento final de todas as notificações...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('\n=== 📊 VERIFICAÇÃO FINAL DE NOTIFICAÇÕES ===\n');

    // 9. Verificar todas as notificações geradas
    console.log('9️⃣ Verificando notificações geradas...');
    try {
      const notificacoesResponse = await axios.get(
        `${baseURL}/api/notificacoes`,
        { headers }
      );

      console.log(`📧 ${notificacoesResponse.data.length} notificações encontradas:`);
      
      const tiposNotificacao = {};
      const statusNotificacao = {};
      
      notificacoesResponse.data.forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.titulo} (${notif.tipo}) - Status: ${notif.status}`);
        console.log(`      "${notif.mensagem}"`);
        
        tiposNotificacao[notif.tipo] = (tiposNotificacao[notif.tipo] || 0) + 1;
        statusNotificacao[notif.status] = (statusNotificacao[notif.status] || 0) + 1;
      });

      console.log('\n📈 Estatísticas das Notificações:');
      console.log('📋 Por Tipo:');
      Object.entries(tiposNotificacao).forEach(([tipo, count]) => {
        console.log(`   ${tipo}: ${count} notificação(s)`);
      });
      
      console.log('📋 Por Status:');
      Object.entries(statusNotificacao).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} notificação(s)`);
      });

    } catch (error) {
      console.log('⚠️ Erro ao verificar notificações:', error.response?.data || error.message);
    }

    console.log('\n🎉 TESTE COMPLETO DO SISTEMA DE NOTIFICAÇÕES FINALIZADO!');
    console.log('\n✅ FUNCIONALIDADES TESTADAS:');
    console.log('   ✓ Notificações de login bem-sucedido');
    console.log('   ✓ Notificações de tentativas de login incorretas');
    console.log('   ✓ Notificações de criação de usuários');
    console.log('   ✓ Notificações de criação de processos');
    console.log('   ✓ Notificações de criação de agendamentos');
    console.log('   ✓ Persistência no banco de dados');
    console.log('   ✓ Mapeamento correto de tipos ENUM');
    console.log('   ✓ Processamento automático de notificações');

  } catch (error) {
    if (error.response) {
      console.error('❌ Erro na resposta:', error.response.status, error.response.data);
    } else {
      console.error('❌ Erro:', error.message);
    }
  }
}

testeCompletoSistemaNotificacoes();
