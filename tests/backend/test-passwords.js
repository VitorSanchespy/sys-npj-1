const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testLogin(email, senha) {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email,
            senha
        });
        console.log(`✅ Login bem-sucedido para ${email} com senha: ${senha}`);
        return true;
    } catch (error) {
        console.log(`❌ Falha no login para ${email} com senha: ${senha}`);
        return false;
    }
}

async function testSenhas() {
    const senhas = ['123456', 'admin', 'password', '12345', 'admin123', '123456789', 'teste'];
    const email = 'admin@teste.com';
    
    console.log('Testando senhas para admin@teste.com...\n');
    
    for (const senha of senhas) {
        const sucesso = await testLogin(email, senha);
        if (sucesso) {
            break;
        }
    }
}

testSenhas().catch(console.error);
