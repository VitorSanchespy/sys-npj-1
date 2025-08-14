/**
 * Criar dados de teste para validar as funcionalidades
 */

const BASE_URL = 'http://localhost:3001';

async function criarDadosTeste() {
  console.log('\n🏗️ === CRIANDO DADOS DE TESTE ===');
  
  try {
    // 1. Login como admin
    console.log('\n🔐 1. Fazendo login como admin...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@npj.com',
        senha: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error('Falha no login: ' + loginData.message);
    }
    
    const token = loginData.token;
    console.log('✅ Login realizado com sucesso');
    
    // 2. Criar processo ativo
    console.log('\n📋 2. Criando processo ativo...');
    const processoAtivo = {
      numero_processo: `2025.TEST.${Date.now()}`,
      titulo: 'Processo de Teste Ativo',
      descricao: 'Processo para testar agendamentos',
      status: 'ativo',
      tipo_processo: 'civil',
      assistido: 'Cliente de Teste',
      contato_assistido: 'cliente@teste.com'
    };
    
    const criarProcessoResponse = await fetch(`${BASE_URL}/api/processos`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(processoAtivo)
    });
    
    const processoAtivoCriado = await criarProcessoResponse.json();
    console.log('📊 Processo ativo criado:', {
      success: processoAtivoCriado.success,
      id: processoAtivoCriado.processo?.id,
      status: processoAtivoCriado.processo?.status
    });
    
    // 3. Criar processo concluído
    console.log('\n🏁 3. Criando processo concluído...');
    const processoConcluido = {
      numero_processo: `2025.TEST.CONCLUIDO.${Date.now()}`,
      titulo: 'Processo de Teste Concluído',
      descricao: 'Processo para testar bloqueio de agendamentos',
      status: 'Concluído',
      tipo_processo: 'civil',
      assistido: 'Cliente Concluído',
      contato_assistido: 'concluido@teste.com',
      data_encerramento: new Date().toISOString()
    };
    
    const criarProcessoConcluidoResponse = await fetch(`${BASE_URL}/api/processos`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(processoConcluido)
    });
    
    const processoConcluidoCriado = await criarProcessoConcluidoResponse.json();
    console.log('📊 Processo concluído criado:', {
      success: processoConcluidoCriado.success,
      id: processoConcluidoCriado.processo?.id,
      status: processoConcluidoCriado.processo?.status
    });
    
    // 4. Testar listagem de processos disponíveis
    console.log('\n📋 4. Testando listagem de processos disponíveis...');
    const processosResponse = await fetch(`${BASE_URL}/api/agendamentos/processos-disponiveis`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const processosData = await processosResponse.json();
    console.log('📊 Processos disponíveis:', {
      success: processosData.success,
      total: processosData.processos?.length || 0,
      message: processosData.message
    });
    
    // Verificar se apenas o processo ativo está na lista
    if (processosData.processos) {
      const processosAtivos = processosData.processos.filter(p => p.status !== 'Concluído');
      const processosConcluidos = processosData.processos.filter(p => p.status === 'Concluído');
      
      console.log(`✅ Processos ativos na lista: ${processosAtivos.length}`);
      console.log(`❌ Processos concluídos na lista: ${processosConcluidos.length}`);
      
      if (processosConcluidos.length === 0) {
        console.log('🎉 SUCESSO: Processos concluídos corretamente excluídos!');
      } else {
        console.log('⚠️ ATENÇÃO: Processos concluídos ainda aparecem na lista');
      }
    }
    
    // 5. Testar validação de agendamento em processo concluído
    if (processoConcluidoCriado.success && processoConcluidoCriado.processo) {
      console.log('\n🚫 5. Testando bloqueio de agendamento em processo concluído...');
      
      const proximaHora = new Date();
      proximaHora.setHours(proximaHora.getHours() + 2);
      const duasHorasDepois = new Date(proximaHora.getTime() + 60 * 60 * 1000);
      
      const agendamentoTeste = {
        titulo: 'Teste - Agendamento Inválido',
        descricao: 'Tentativa de agendamento em processo concluído',
        dataEvento: proximaHora.toISOString(),
        dataFim: duasHorasDepois.toISOString(),
        local: 'Sala de Teste',
        tipo_evento: 'reuniao',
        processoId: processoConcluidoCriado.processo.id
      };
      
      const agendamentoResponse = await fetch(`${BASE_URL}/api/agendamentos`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(agendamentoTeste)
      });
      
      const agendamentoResult = await agendamentoResponse.json();
      
      if (agendamentoResult.success) {
        console.log('❌ ERRO: Sistema permitiu agendamento em processo concluído!');
      } else {
        console.log('✅ SUCESSO: Sistema bloqueou agendamento em processo concluído');
        console.log('📝 Mensagem:', agendamentoResult.error);
      }
    }
    
    console.log('\n🎉 === TESTES CONCLUÍDOS ===');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  criarDadosTeste();
}

module.exports = { criarDadosTeste };
