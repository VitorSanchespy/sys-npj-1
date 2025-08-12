#!/usr/bin/env node

/**
 * Script para criar usuários de teste no sistema NPJ
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function criarUsuariosTeste() {
  console.log('🔧 CRIANDO USUÁRIOS DE TESTE');
  console.log('============================');

  const usuarios = [
    {
      nome: 'Administrador NPJ',
      email: 'admin@npj.com',
      senha: '123456',
      telefone: '(11) 99999-0001',
      role_id: 1 // Admin
    },
    {
      nome: 'Professor NPJ',
      email: 'professor@npj.com',
      senha: '123456',
      telefone: '(11) 99999-0002',
      role_id: 2 // Professor
    },
    {
      nome: 'Aluno NPJ',
      email: 'aluno@npj.com',
      senha: '123456',
      telefone: '(11) 99999-0003',
      role_id: 3 // Aluno
    }
  ];

  // Primeiro, tentar fazer login como admin existente (se houver)
  let adminToken = null;
  
  try {
    // Tentar login com diferentes possibilidades de admin
    const possiveisAdmins = [
      { email: 'admin@admin.com', senha: 'admin123' },
      { email: 'root@npj.com', senha: '123456' },
      { email: 'admin@npj.com', senha: '123456' }
    ];

    for (const admin of possiveisAdmins) {
      try {
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, admin);
        if (loginResponse.data.token) {
          adminToken = loginResponse.data.token;
          console.log(`✅ Login admin existente: ${admin.email}`);
          break;
        }
      } catch (e) {
        // Continua tentando
      }
    }
  } catch (error) {
    // Sem admin existente
  }

  // Se não conseguiu admin, usar registro público
  if (!adminToken) {
    console.log('ℹ️ Usando registro público para criar usuários');
    
    for (const usuario of usuarios) {
      try {
        const response = await axios.post(`${BASE_URL}/api/auth/registro`, usuario);
        
        if (response.data.token || response.status === 201) {
          console.log(`✅ Usuário criado: ${usuario.email} (${usuario.role_id === 1 ? 'Admin' : usuario.role_id === 2 ? 'Professor' : 'Aluno'})`);
        }
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.erro?.includes('já existe')) {
          console.log(`ℹ️ Usuário já existe: ${usuario.email}`);
        } else {
          console.log(`❌ Erro ao criar ${usuario.email}:`, error.response?.data?.erro || error.message);
        }
      }
    }
  } else {
    // Usar endpoint de criação de usuários com token admin
    console.log('ℹ️ Usando token admin para criar usuários');
    
    for (const usuario of usuarios) {
      try {
        const response = await axios.post(`${BASE_URL}/api/usuarios`, usuario, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        console.log(`✅ Usuário criado: ${usuario.email} (${usuario.role_id === 1 ? 'Admin' : usuario.role_id === 2 ? 'Professor' : 'Aluno'})`);
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.erro?.includes('já existe')) {
          console.log(`ℹ️ Usuário já existe: ${usuario.email}`);
        } else {
          console.log(`❌ Erro ao criar ${usuario.email}:`, error.response?.data?.erro || error.message);
        }
      }
    }
  }

  console.log('\n🧪 TESTANDO LOGINS CRIADOS');
  console.log('==========================');

  // Testar login de cada usuário criado
  for (const usuario of usuarios) {
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: usuario.email,
        senha: usuario.senha
      });

      if (loginResponse.data.token) {
        console.log(`✅ Login funcionando: ${usuario.email}`);
      }
    } catch (error) {
      console.log(`❌ Login falhou: ${usuario.email} -`, error.response?.data?.erro || error.message);
    }
  }

  console.log('\n🎯 USUÁRIOS DE TESTE PRONTOS!');
}

// Executar
criarUsuariosTeste().catch(console.error);
