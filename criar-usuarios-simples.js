const axios = require('axios');

// Configurações
const backendUrl = 'http://localhost:3001';

// Usuários para criar
const usuarios = [
  {
    nome: 'Admin Sistema',
    email: 'admin2@test.com',
    senha: 'senha123',
    role_id: 1
  },
  {
    nome: 'Professor Teste',
    email: 'professor2@test.com',
    senha: 'senha123',
    role_id: 2
  },
  {
    nome: 'Aluno Teste',
    email: 'aluno2@test.com',
    senha: 'senha123',
    role_id: 3
  }
];

async function criarUsuarios() {
  console.log('🔍 CRIANDO USUÁRIOS DE TESTE...\n');

  for (const usuario of usuarios) {
    try {
      console.log(`📝 Criando usuário: ${usuario.email}...`);
      const response = await axios.post(`${backendUrl}/auth/registro`, usuario);
      
      if (response.status === 201) {
        console.log('✅ Usuário criado com sucesso');
        console.log('👤 Nome:', response.data.usuario?.nome);
        console.log('🔑 Role:', response.data.usuario?.role);
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.erro?.includes('já existe')) {
        console.log('ℹ️ Usuário já existe');
      } else {
        console.log(`❌ Erro ao criar ${usuario.email}:`, error.response?.data?.erro || error.message);
      }
    }
    console.log('---');
  }
  
  console.log('\n✅ Processo de criação concluído!');
}

// Executar a criação
criarUsuarios();
