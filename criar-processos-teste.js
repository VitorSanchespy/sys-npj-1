const axios = require('axios');

const backendUrl = 'http://localhost:3001';

// Login com Admin
const adminCredentials = {
  email: 'admin@test.com',
  senha: 'senha123'
};

// Processos de teste
const processos = [
  {
    numero: 'PROC-2024-001',
    titulo: 'Processo de Teste 1',
    descricao: 'Descrição do processo de teste 1',
    status: 'Em Andamento',
    tipo_processo: 'Civil',
    prioridade: 'Alta'
  },
  {
    numero: 'PROC-2024-002', 
    titulo: 'Processo de Teste 2',
    descricao: 'Descrição do processo de teste 2',
    status: 'Aguardando',
    tipo_processo: 'Trabalhista',
    prioridade: 'Média'
  }
];

async function criarProcessosTeste() {
  try {
    console.log('🔍 CRIANDO PROCESSOS DE TESTE...\n');

    // Login
    console.log('📝 Fazendo login como Admin...');
    const loginResponse = await axios.post(`${backendUrl}/auth/login`, adminCredentials);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Erro no login');
      return;
    }

    const { token } = loginResponse.data;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('✅ Login realizado com sucesso\n');

    // Criar processos
    for (const processo of processos) {
      try {
        console.log(`📋 Criando processo: ${processo.numero}...`);
        const response = await axios.post(`${backendUrl}/api/processos/novo`, processo, { headers });
        
        if (response.status === 201) {
          console.log('✅ Processo criado com sucesso');
          console.log('🆔 ID:', response.data.id);
          console.log('📄 Número:', response.data.numero);
        }
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.erro?.includes('já existe')) {
          console.log('ℹ️ Processo já existe');
        } else {
          console.log(`❌ Erro ao criar processo ${processo.numero}:`, error.response?.data?.erro || error.message);
        }
      }
      console.log('---');
    }

    console.log('\n✅ Processo de criação concluído!');

  } catch (error) {
    console.error('❌ Erro durante a criação:', error.message);
  }
}

// Executar a criação
criarProcessosTeste();
