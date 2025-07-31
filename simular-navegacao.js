const axios = require('axios');

const backendUrl = 'http://localhost:3001';

// Simular o que acontece no frontend
async function simularFluxoNavegacao() {
  try {
    console.log('🔍 SIMULANDO FLUXO DE NAVEGAÇÃO FRONTEND...\n');

    // 1. Login como Professor (agora com role correta)
    console.log('📝 1. Fazendo login como Professor...');
    const loginResponse = await axios.post(`${backendUrl}/auth/login`, {
      email: 'professor2@test.com',
      senha: 'senha123'
    });
    
    const { token, usuario } = loginResponse.data;
    console.log('✅ Login realizado');
    console.log('👤 Usuário:', usuario.nome);
    console.log('🔑 Role:', usuario.role);
    console.log('🆔 User ID:', usuario.id);

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Criar um processo primeiro se não existir
    console.log('\n📋 2. Criando um processo de teste...');
    let processoId;
    try {
      const novoProcesso = await axios.post(`${backendUrl}/api/processos/novo`, {
        numero: 'TEST-NAV-001',
        titulo: 'Processo para Teste de Navegação',
        descricao: 'Processo criado para testar navegação',
        status: 'Em Andamento',
        tipo_processo: 'Civil',
        prioridade: 'Alta'
      }, { headers });
      
      processoId = novoProcesso.data.id;
      console.log('✅ Processo criado, ID:', processoId);
    } catch (error) {
      console.log('ℹ️ Processo pode já existir, tentando listar...');
      
      // Listar processos para pegar um ID
      const processosResponse = await axios.get(`${backendUrl}/api/processos`, { headers });
      if (processosResponse.data.length > 0) {
        processoId = processosResponse.data[0].id;
        console.log('✅ Usando processo existente, ID:', processoId);
      } else {
        console.log('❌ Nenhum processo encontrado');
        return;
      }
    }

    // 3. Simular click em "Ver Detalhes" - testar GET /processos/:id
    console.log(`\n👁️ 3. Simulando click "Ver Detalhes" - GET /processos/${processoId}...`);
    try {
      const detailResponse = await axios.get(`${backendUrl}/api/processos/${processoId}`, { headers });
      console.log('✅ Rota funcionando corretamente');
      console.log('📄 Processo:', {
        id: detailResponse.data.id,
        numero: detailResponse.data.numero,
        titulo: detailResponse.data.titulo
      });
    } catch (error) {
      console.log('❌ Erro na rota de detalhes:', error.response?.status, error.response?.data);
      
      // Verificar se é problema de permissão
      if (error.response?.status === 403) {
        console.log('🔒 PROBLEMA DE PERMISSÃO DETECTADO!');
        console.log('Role do usuário:', usuario.role);
        console.log('Role ID:', usuario.role_id);
      }
    }

    // 4. Testar rota alternativa de detalhes
    console.log(`\n🔍 4. Testando rota alternativa - GET /processos/${processoId}/detalhes...`);
    try {
      const detalheResponse = await axios.get(`${backendUrl}/api/processos/${processoId}/detalhes`, { headers });
      console.log('✅ Rota de detalhes funcionando');
    } catch (error) {
      console.log('❌ Erro na rota de detalhes alternativa:', error.response?.status, error.response?.data);
    }

    // 5. Verificar token e headers
    console.log('\n🔐 5. Verificando autenticação...');
    console.log('Token presente:', !!token);
    console.log('Headers de autorização:', headers.Authorization ? 'Configurado' : 'Ausente');

    console.log('\n✅ SIMULAÇÃO COMPLETA!');
    console.log('\n📋 RESUMO:');
    console.log('- Login: ✅ Funcionando');
    console.log('- Token: ✅ Presente');
    console.log(`- Processo ID: ${processoId}`);
    console.log('- Headers: ✅ Configurados');

  } catch (error) {
    console.error('❌ Erro durante a simulação:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Executar simulação
simularFluxoNavegacao();
