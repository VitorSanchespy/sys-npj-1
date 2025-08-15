// Teste para verificar a criação de agendamentos
const api = require('./backend/services/api');

async function testeAgendamento() {
  try {
    console.log('🧪 Testando criação de agendamento...');
    
    const dadosTest = {
      titulo: 'Teste de Reunião',
      descricao: 'Reunião de teste',
      data_inicio: new Date().toISOString(),
      data_fim: new Date(Date.now() + 3600000).toISOString(), // +1 hora
      local: 'Sala 101',
      tipo: 'reuniao',
      observacoes: 'Observações de teste'
    };
    
    console.log('📝 Dados enviados:', dadosTest);
    
    const response = await fetch('http://localhost:3001/api/agendamentos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer SEU_TOKEN_AQUI' // Substitua por um token válido
      },
      body: JSON.stringify(dadosTest)
    });
    
    const result = await response.json();
    console.log('📋 Resposta:', result);
    
    if (response.ok) {
      console.log('✅ Agendamento criado com sucesso!');
    } else {
      console.log('❌ Erro:', result);
    }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

testeAgendamento();
