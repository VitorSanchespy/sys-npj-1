const axios = require('axios');

// Configurações
const backendUrl = 'http://localhost:3001';
const frontendUrl = 'http://localhost:5173';

// Dados de teste para login como Professor
const professorCredentials = {
  email: 'professor@test.com',
  senha: 'senha123'
};

async function debugNavigationFlow() {
  try {
    console.log('🔍 INICIANDO DEBUG DA NAVEGAÇÃO...\n');

    // 1. Fazer login como Professor
    console.log('📝 1. Fazendo login como Professor...');
    const loginResponse = await axios.post(`${backendUrl}/auth/login`, professorCredentials);
    
    if (loginResponse.status === 200) {
      console.log('✅ Login realizado com sucesso');
      console.log('👤 Usuário:', loginResponse.data.usuario?.nome);
      console.log('🔑 Role:', loginResponse.data.usuario?.role);
      console.log('🎫 Token:', loginResponse.data.token ? 'Presente' : 'Ausente');
    } else {
      console.log('❌ Erro no login');
      return;
    }

    const { token, usuario } = loginResponse.data;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Listar processos para pegar um ID válido
    console.log('\n📋 2. Listando processos...');
    const processosResponse = await axios.get(`${backendUrl}/processos`, { headers });
    
    if (processosResponse.data.length > 0) {
      console.log(`✅ Encontrados ${processosResponse.data.length} processos`);
      console.log('📄 Primeiro processo:', {
        id: processosResponse.data[0].id,
        numero: processosResponse.data[0].numero,
        titulo: processosResponse.data[0].titulo
      });
    } else {
      console.log('❌ Nenhum processo encontrado');
      return;
    }

    const processoId = processosResponse.data[0].id;

    // 3. Testar acesso direto ao processo por ID
    console.log(`\n🔍 3. Testando acesso ao processo ID: ${processoId}...`);
    try {
      const processoResponse = await axios.get(`${backendUrl}/processos/${processoId}`, { headers });
      console.log('✅ Processo acessado com sucesso');
      console.log('📄 Dados do processo:', {
        id: processoResponse.data.id,
        numero: processoResponse.data.numero,
        titulo: processoResponse.data.titulo
      });
    } catch (error) {
      console.log('❌ Erro ao acessar processo:', error.response?.status, error.response?.data);
    }

    // 4. Testar rota de detalhes
    console.log(`\n🔍 4. Testando rota de detalhes: /processos/${processoId}/detalhes...`);
    try {
      const detalhesResponse = await axios.get(`${backendUrl}/processos/${processoId}/detalhes`, { headers });
      console.log('✅ Detalhes acessados com sucesso');
      console.log('📄 Dados dos detalhes:', {
        id: detalhesResponse.data.id,
        numero: detalhesResponse.data.numero
      });
    } catch (error) {
      console.log('❌ Erro ao acessar detalhes:', error.response?.status, error.response?.data);
    }

    // 5. Verificar permissões do usuário
    console.log('\n🔒 5. Verificando permissões...');
    console.log('Role do usuário:', usuario.role);
    console.log('Role ID:', usuario.role_id);
    console.log('Tem permissão para Professor?', ['Professor', 'Admin', 'Aluno'].includes(usuario.role));

    console.log('\n✅ DEBUG COMPLETO!');

  } catch (error) {
    console.error('❌ Erro durante o debug:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Executar o debug
debugNavigationFlow();
