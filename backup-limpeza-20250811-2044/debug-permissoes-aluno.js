const axios = require('axios');

async function debugPermissoesAluno() {
  try {
    // Login como aluno
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'aluno.teste@npj.com',
      senha: '123456'
    });

    const token = loginResponse.data.token;
    
    console.log('=== TESTANDO PERMISSÕES ALUNO ===');
    
    // 1. GET /usuarios (deveria ser 403)
    try {
      const response = await axios.get('http://localhost:3001/usuarios', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('GET /usuarios - Status:', response.status, '- Deveria ser 403');
    } catch (error) {
      console.log('GET /usuarios - Status:', error.response?.status, '- CORRETO (403)');
    }
    
    // 2. POST /processos (deveria ser 403)
    try {
      const response = await axios.post('http://localhost:3001/processos', {
        numero_processo: `TEST-ALUNO-${Date.now()}`,
        titulo: 'Teste Aluno',
        contato_assistido: 'teste@aluno.com'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('POST /processos - Status:', response.status, '- Deveria ser 403');
    } catch (error) {
      console.log('POST /processos - Status:', error.response?.status, '- CORRETO (403)');
    }

  } catch (error) {
    console.log('Erro:', error.message);
  }
}

debugPermissoesAluno();
