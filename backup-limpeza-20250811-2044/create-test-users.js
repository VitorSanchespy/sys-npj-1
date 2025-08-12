/**
 * Script para criar usuários de teste com senhas conhecidas
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function criarUsuariosTeste() {
  console.log('🔧 Criando usuários de teste com credenciais conhecidas...\n');

  // Fazer login como admin primeiro
  let adminToken = null;
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@teste.com',
      senha: '123456'
    });
    adminToken = loginResponse.data.token;
    console.log('✅ Login como admin realizado');
  } catch (error) {
    console.log('❌ Erro no login admin:', error.response?.data || error.message);
    return;
  }

  // Definir usuários para teste
  const usuarios = [
    {
      nome: 'Professor Teste Automatico',
      email: 'prof.teste@npj.com',
      senha: '123456',
      role_id: 2 // Professor
    },
    {
      nome: 'Aluno Teste Automatico', 
      email: 'aluno.teste@npj.com',
      senha: '123456',
      role_id: 3 // Aluno
    }
  ];

  // Criar usuários via endpoint de usuários (como admin)
  for (const usuario of usuarios) {
    try {
      const response = await axios.post(`${BASE_URL}/usuarios`, usuario, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log(`✅ Usuário ${usuario.email} criado com sucesso`);
      
      // Testar login
      try {
        await axios.post(`${BASE_URL}/auth/login`, {
          email: usuario.email,
          senha: usuario.senha
        });
        console.log(`✅ Login funcionando para ${usuario.email}\n`);
      } catch (loginError) {
        console.log(`❌ Login falhou para ${usuario.email}\n`);
      }
      
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.erro?.includes('já existe')) {
        console.log(`⚠️ Usuário ${usuario.email} já existe\n`);
      } else {
        console.log(`❌ Erro ao criar ${usuario.email}:`, error.response?.data || error.message, '\n');
      }
    }
  }

  console.log('✅ Processo concluído!');
  console.log('\n📋 Credenciais para testes:');
  console.log('Admin: admin@teste.com / 123456');
  console.log('Professor: prof.teste@npj.com / 123456'); 
  console.log('Aluno: aluno.teste@npj.com / 123456');
}

criarUsuariosTeste().catch(console.error);
