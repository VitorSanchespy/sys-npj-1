const axios = require('axios');

async function debugArquivosAluno() {
  try {
    // Login como aluno
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'aluno.teste@npj.com',
      senha: '123456'
    });

    const token = loginResponse.data.token;
    const userId = loginResponse.data.usuario.id;
    
    console.log('=== TESTANDO ARQUIVOS ALUNO ===');
    console.log('User ID do aluno:', userId);
    
    // Testar acesso aos próprios arquivos (deveria funcionar)
    try {
      const response = await axios.get(`http://localhost:3001/arquivos/usuario/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`GET /arquivos/usuario/${userId} (próprios) - Status:`, response.status, '- CORRETO');
    } catch (error) {
      console.log(`GET /arquivos/usuario/${userId} (próprios) - Status:`, error.response?.status, '- ERRO');
    }
    
    // Testar acesso aos arquivos de outro usuário (deveria ser 403)
    try {
      const response = await axios.get('http://localhost:3001/arquivos/usuario/1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('GET /arquivos/usuario/1 (outros) - Status:', response.status, '- Deveria ser 403');
    } catch (error) {
      console.log('GET /arquivos/usuario/1 (outros) - Status:', error.response?.status, '- CORRETO (403)');
    }

  } catch (error) {
    console.log('Erro:', error.message);
  }
}

debugArquivosAluno();
