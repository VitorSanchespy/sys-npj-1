// Script de teste automático para o sistema
const axios = require('axios');

const API_URL = 'http://localhost:3001';
let token = null;

// Dados de teste
const testUser = {
  email: 'admin@teste.com',
  senha: '123456'
};

const testProcess = {
  numero_processo: '0001234-56.2024.8.11.0000',
  descricao: 'Processo de teste automatizado',
  assistido: 'João da Silva',
  contato_assistido: 'joao@email.com',
  status: 'ativo',
  materia_assunto_id: 59, // ID válido da tabela
  fase_id: null, // Será preenchido dinamicamente
  diligencia_id: null, // Será preenchido dinamicamente
  local_tramitacao_id: null, // Será preenchido dinamicamente
  sistema: 'PJE',
  idusuario_responsavel: 353, // ID do admin
  observacoes: 'Processo criado automaticamente para teste'
};

const testUser2 = {
  nome: 'Usuário Teste',
  email: `teste${Date.now()}@automatizado.com`, // Email único baseado no timestamp
  senha: '123456',
  role_id: 2
};

// Função de login
async function login() {
  try {
    console.log('🔐 Fazendo login...');
    const response = await axios.post(`${API_URL}/auth/login`, testUser);
    token = response.data.token;
    console.log('✅ Login realizado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro no login:', error.response?.data?.message || error.message);
    return false;
  }
}

// Teste de usuários
async function testUsers() {
  console.log('\n📋 TESTE DE USUÁRIOS');
  try {
    // Listar usuários
    console.log('  📄 Listando usuários...');
    const users = await axios.get(`${API_URL}/api/usuarios`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`  ✅ ${users.data.length} usuários encontrados`);

    // Criar usuário
    console.log('  ➕ Criando usuário de teste...');
    const newUser = await axios.post(`${API_URL}/api/usuarios`, testUser2, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('  ✅ Usuário criado:', newUser.data.nome);

    // Atualizar usuário
    console.log('  ✏️ Atualizando usuário...');
    const updatedUser = await axios.put(`${API_URL}/api/usuarios/${newUser.data.id}`, {
      ...testUser2,
      nome: 'Usuário Teste Atualizado'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('  ✅ Usuário atualizado');

    // Buscar usuário por ID
    console.log('  🔍 Buscando usuário por ID...');
    const userById = await axios.get(`${API_URL}/api/usuarios/${newUser.data.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('  ✅ Usuário encontrado:', userById.data.nome);

    // Deletar usuário (soft delete)
    console.log('  🗑️ Deletando usuário...');
    await axios.delete(`${API_URL}/api/usuarios/${newUser.data.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('  ✅ Usuário deletado (soft delete)');

  } catch (error) {
    console.error('  ❌ Erro no teste de usuários:', error.response?.data?.message || error.message);
  }
}

// Teste de processos
async function testProcesses() {
  console.log('\n⚖️ TESTE DE PROCESSOS');
  try {
    // Listar processos
    console.log('  📄 Listando processos...');
    const processes = await axios.get(`${API_URL}/api/processos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`  ✅ ${processes.data.length} processos encontrados`);

    // Buscar IDs válidos das tabelas auxiliares
    const auxData = await axios.get(`${API_URL}/api/aux/materia-assunto`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const fases = await axios.get(`${API_URL}/api/aux/fase`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const diligencias = await axios.get(`${API_URL}/api/aux/diligencia`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const locais = await axios.get(`${API_URL}/api/aux/local-tramitacao`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Buscar um usuário admin para usar como responsável
    const users = await axios.get(`${API_URL}/api/usuarios`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const adminUser = users.data.find(user => user.role_id === 1);
    
    const processToCreate = {
      ...testProcess,
      materia_assunto_id: auxData.data.length > 0 ? auxData.data[0].id : 59,
      fase_id: fases.data.length > 0 ? fases.data[0].id : null,
      diligencia_id: diligencias.data.length > 0 ? diligencias.data[0].id : null,
      local_tramitacao_id: locais.data.length > 0 ? locais.data[0].id : null,
      idusuario_responsavel: adminUser ? adminUser.id : 353
    };

    // Criar processo
    console.log('  ➕ Criando processo de teste...');
    const newProcess = await axios.post(`${API_URL}/api/processos/novo`, processToCreate, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('  ✅ Processo criado:', newProcess.data.numero_processo);

    // Buscar processo por ID  
    console.log('  🔍 Buscando processo detalhado...');
    const processDetails = await axios.get(`${API_URL}/api/processos/${newProcess.data.id}/detalhes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('  ✅ Processo encontrado:', processDetails.data.numero_processo || processDetails.data.numero);

    // Atualizar processo
    console.log('  ✏️ Atualizando processo...');
    await axios.patch(`${API_URL}/api/processos/${newProcess.data.id}`, {
      descricao: 'Processo atualizado por teste automatizado'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('  ✅ Processo atualizado');

    return newProcess.data.id;
  } catch (error) {
    console.error('  ❌ Erro no teste de processos:', error.response?.data?.message || error.message);
    return null;
  }
}

// Teste de arquivos
async function testFiles(processId) {
  console.log('\n📁 TESTE DE ARQUIVOS');
  try {
    // Criar arquivo de teste
    const fs = require('fs');
    const path = require('path');
    const FormData = require('form-data');
    
    const testContent = 'Este é um arquivo de teste automatizado.';
    const testFileName = 'teste_automatizado.txt';
    const testFilePath = path.join(__dirname, testFileName);
    
    fs.writeFileSync(testFilePath, testContent);
    
    console.log('  📤 Fazendo upload de arquivo...');
    const form = new FormData();
    form.append('arquivo', fs.createReadStream(testFilePath));
    form.append('nome', testFileName);
    form.append('processo_id', processId);
    
    const uploadResponse = await axios.post(`${API_URL}/api/arquivos/upload`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    console.log('  ✅ Arquivo enviado:', uploadResponse.data.nome);

    // Listar arquivos do processo
    console.log('  📄 Listando arquivos do processo...');
    const processFiles = await axios.get(`${API_URL}/api/arquivos/processo/${processId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`  ✅ ${processFiles.data.length} arquivos encontrados`);

    // Deletar arquivo de teste
    console.log('  🗑️ Deletando arquivo...');
    await axios.delete(`${API_URL}/api/arquivos/${uploadResponse.data.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('  ✅ Arquivo deletado');

    // Limpar arquivo local
    fs.unlinkSync(testFilePath);
    
  } catch (error) {
    console.error('  ❌ Erro no teste de arquivos:', error.response?.data?.message || error.message);
  }
}

// Teste de agendamentos
async function testAgendamentos() {
  console.log('\n📅 TESTE DE AGENDAMENTOS');
  try {
    // Listar agendamentos
    console.log('  📄 Listando agendamentos...');
    const agendamentos = await axios.get(`${API_URL}/api/agendamentos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`  ✅ ${agendamentos.data.length} agendamentos encontrados`);

    // Buscar um processo existente para vincular o agendamento
    const processes = await axios.get(`${API_URL}/api/processos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const testAgendamento = {
      titulo: 'Teste Automatizado',
      descricao: 'Agendamento criado por teste automatizado',
      data_evento: new Date(Date.now() + 86400000).toISOString(), // amanhã
      tipo: 'evento',
      local_evento: 'Sala de Teste',
      status: 'agendado',
      lembrete_1_dia: true,
      processo_id: processes.data.length > 0 ? processes.data[0].id : null,
      usuario_id: 353 // Admin user ID
    };

    // Criar agendamento
    console.log('  ➕ Criando agendamento de teste...');
    const newAgendamento = await axios.post(`${API_URL}/api/agendamentos`, testAgendamento, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('  ✅ Agendamento criado:', newAgendamento.data.titulo);

    // Atualizar agendamento
    console.log('  ✏️ Atualizando agendamento...');
    await axios.put(`${API_URL}/api/agendamentos/${newAgendamento.data.id}`, {
      ...testAgendamento,
      titulo: 'Teste Automatizado - Atualizado'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('  ✅ Agendamento atualizado');

    // Deletar agendamento
    console.log('  🗑️ Deletando agendamento...');
    await axios.delete(`${API_URL}/api/agendamentos/${newAgendamento.data.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('  ✅ Agendamento deletado');

  } catch (error) {
    console.error('  ❌ Erro no teste de agendamentos:', error.response?.data?.message || error.message);
  }
}

// Teste de perfil
async function testProfile() {
  console.log('\n👤 TESTE DE PERFIL');
  try {
    // Obter perfil
    console.log('  📄 Obtendo perfil...');
    const profile = await axios.get(`${API_URL}/auth/perfil`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('  ✅ Perfil obtido:', profile.data.nome);

    // Atualizar perfil
    console.log('  ✏️ Atualizando perfil...');
    await axios.put(`${API_URL}/api/usuarios/me`, {
      nome: profile.data.nome + ' - Teste',
      telefone: '(65) 99999-9999'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('  ✅ Perfil atualizado');

    // Restaurar perfil original
    await axios.put(`${API_URL}/api/usuarios/me`, {
      nome: profile.data.nome,
      telefone: profile.data.telefone
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

  } catch (error) {
    console.error('  ❌ Erro no teste de perfil:', error.response?.data?.message || error.message);
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 INICIANDO TESTE MASSIVO DO SISTEMA');
  console.log('=======================================');
  
  const success = await login();
  if (!success) {
    console.log('❌ Falha no login. Encerrando testes.');
    return;
  }

  await testProfile();
  await testUsers();
  const processId = await testProcesses();
  if (processId) {
    await testFiles(processId);
  }
  await testAgendamentos();

  console.log('\n🎉 TESTE MASSIVO CONCLUÍDO');
  console.log('==========================');
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };
