/**
 * Script para popular usuários de teste com credenciais padronizadas
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Usuários de teste padrão
const TEST_USERS = [
  {
    nome: 'Admin Teste',
    email: 'admin@teste.com', 
    senha: '123456',
    role_id: 1 // Admin
  },
  {
    nome: 'Professor Teste',
    email: 'professor@teste.com',
    senha: '123456', 
    role_id: 2 // Professor
  },
  {
    nome: 'Aluno Teste',
    email: 'aluno@teste.com',
    senha: '123456',
    role_id: 3 // Aluno
  }
];

async function popularUsuarios() {
  console.log('🔧 Populando usuários de teste...');
  
  // Primeiro, fazer login como admin para ter permissão
  let adminToken = null;
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@npj.com',
      senha: '123456'
    });
    adminToken = loginResponse.data.token;
    console.log('✅ Login como admin realizado');
  } catch (error) {
    console.log('⚠️ Não foi possível fazer login como admin, tentando criar usuários sem autenticação');
  }

  // Criar/atualizar usuários de teste
  for (const user of TEST_USERS) {
    try {
      // Primeiro tentar login para ver se já existe
      try {
        await axios.post(`${BASE_URL}/auth/login`, {
          email: user.email,
          senha: user.senha
        });
        console.log(`✅ Usuário ${user.email} já existe e funciona`);
        continue;
      } catch (loginError) {
        // Usuário não existe ou senha está errada, vamos tentar criar/atualizar
      }

      // Tentar registrar o usuário
      const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
      
      try {
        await axios.post(`${BASE_URL}/auth/registro`, user, { headers });
        console.log(`✅ Usuário ${user.email} criado com sucesso`);
      } catch (registerError) {
        if (registerError.response?.status === 400 && registerError.response?.data?.erro?.includes('já existe')) {
          console.log(`⚠️ Usuário ${user.email} já existe - tentando atualizar senha`);
          
          // Se usuário já existe, tentar atualizar via endpoint de usuários
          try {
            // Primeiro buscar o ID do usuário
            const usersResponse = await axios.get(`${BASE_URL}/usuarios`, { headers });
            const existingUser = usersResponse.data.find(u => u.email === user.email);
            
            if (existingUser) {
              // Atualizar senha
              await axios.put(`${BASE_URL}/usuarios/${existingUser.id}`, {
                senha: user.senha
              }, { headers });
              console.log(`✅ Senha atualizada para ${user.email}`);
            }
          } catch (updateError) {
            console.log(`❌ Erro ao atualizar ${user.email}:`, updateError.response?.data || updateError.message);
          }
        } else {
          console.log(`❌ Erro ao criar ${user.email}:`, registerError.response?.data || registerError.message);
        }
      }

      // Testar login após criação/atualização
      try {
        await axios.post(`${BASE_URL}/auth/login`, {
          email: user.email,
          senha: user.senha
        });
        console.log(`✅ Login teste para ${user.email} funcionando`);
      } catch (testLoginError) {
        console.log(`❌ Login teste falhou para ${user.email}`);
      }

    } catch (error) {
      console.log(`❌ Erro geral com ${user.email}:`, error.message);
    }
  }

  console.log('\n✅ Processo de população de usuários concluído!');
  console.log('Agora você pode executar os testes com: npm run test:backend');
}

// Executar se chamado diretamente
if (require.main === module) {
  popularUsuarios().catch(console.error);
}

module.exports = popularUsuarios;
