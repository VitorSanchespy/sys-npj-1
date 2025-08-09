// Teste específico para Google OAuth
// Execute: node test-google-oauth.js

const axios = require('axios');

// Simular um token JWT básico para teste (apenas para debug)
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGVfaWQiOjEsInJvbGUiOiJBZG1pbiIsImlhdCI6MTY0MDk5NTIwMCwiZXhwIjo5OTk5OTk5OTk5fQ.test';

async function testarGoogleOAuth() {
  console.log('🔐 Testando Google OAuth...\n');

  try {
    // Testar obtenção da URL de autorização
    console.log('1. Testando geração de URL de autorização...');
    
    const response = await axios.get('http://localhost:3001/api/google-calendar/auth-url', {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    if (response.data.authUrl) {
      console.log('✅ URL de autorização gerada com sucesso!');
      console.log('🔗 URL:', response.data.authUrl);
      
      // Extrair redirect_uri da URL para verificar
      const url = new URL(response.data.authUrl);
      const redirectUri = url.searchParams.get('redirect_uri');
      console.log('📍 Redirect URI encontrado:', redirectUri);
      
      if (redirectUri === 'http://localhost:5173/auth/google/callback') {
        console.log('✅ Redirect URI está correto!');
      } else {
        console.log('❌ Redirect URI incorreto! Esperado: http://localhost:5173/auth/google/callback');
      }
    } else {
      console.log('❌ Nenhuma URL de autorização retornada');
    }

  } catch (error) {
    console.error('❌ Erro ao testar OAuth:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }

  console.log('\n🎯 Próximo passo:');
  console.log('Configure no Google Cloud Console:');
  console.log('- Authorized redirect URIs: http://localhost:5173/auth/google/callback');
  console.log('- Authorized JavaScript origins: http://localhost:5173');
}

testarGoogleOAuth();
