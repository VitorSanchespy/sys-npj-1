// Teste simples do modelo de agendamento
require('dotenv').config({ path: './backend/.env' });
const { agendamentoModels: Agendamento } = require('./backend/models/indexModels');

async function testeAgendamento() {
  try {
    console.log('🧪 Testando modelo Agendamento...');
    
    // Teste 1: Listar todos
    console.log('1. Listando agendamentos...');
    const agendamentos = await Agendamento.findAll();
    console.log(`✅ Encontrados ${agendamentos.length} agendamentos`);
    
    // Teste 2: Criar agendamento simples
    console.log('2. Criando agendamento...');
    const novoAgendamento = await Agendamento.create({
      usuario_id: 351,
      tipo: 'reuniao',
      titulo: 'Teste Direto Modelo',
      data_evento: new Date('2025-07-30 10:00:00')
    });
    console.log('✅ Agendamento criado:', novoAgendamento.id);
    
    // Teste 3: Deletar o agendamento criado
    console.log('3. Deletando agendamento...');
    await novoAgendamento.destroy();
    console.log('✅ Agendamento deletado');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  }
  
  process.exit();
}

testeAgendamento();
