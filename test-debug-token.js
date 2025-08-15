const fetch = require('node-fetch');

async function obterToken() {
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@teste.com',
        senha: 'admin123'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Token obtido:', data.token.substring(0, 50) + '...');
      
      // Agora testar listagem de agendamentos com o token
      const agendamentosResponse = await fetch('http://localhost:3001/api/agendamentos', {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });

      const agendamentosData = await agendamentosResponse.json();
      console.log('📅 Resposta agendamentos:', JSON.stringify(agendamentosData, null, 2));
      
    } else {
      console.log('❌ Erro no login:', data);
    }
  } catch (error) {
    console.error('💥 Erro:', error.message);
  }
}

obterToken();
