// Teste simples de API
const testLogin = async () => {
  try {
    console.log('Testando login...');
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@teste.com',
        senha: '123456'
      })
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (data.success) {
      console.log('✅ Login realizado com sucesso!');
      console.log('User role_id:', data.usuario.role_id);
      console.log('User role:', data.usuario.role);
    } else {
      console.log('❌ Falha no login:', data.message);
    }
  } catch (error) {
    console.error('❌ Erro de rede:', error.message);
  }
};

testLogin();
