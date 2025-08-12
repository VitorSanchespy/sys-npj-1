const axios = require('axios');
const fs = require('fs');

async function debugRefreshToken() {
  try {
    // Fazer login primeiro para obter tokens
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'admin@teste.com',
      senha: '123456'
    });

    console.log('Login response:', {
      status: loginResponse.status,
      hasToken: !!loginResponse.data.token,
      hasRefreshToken: !!loginResponse.data.refreshToken
    });

    if (loginResponse.data.refreshToken) {
      // Testar refresh token
      const refreshResponse = await axios.post('http://localhost:3001/auth/refresh', {
        refreshToken: loginResponse.data.refreshToken
      });

      console.log('Refresh success:', {
        status: refreshResponse.status,
        hasNewToken: !!refreshResponse.data.token
      });
    }

  } catch (error) {
    console.log('Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }
}

debugRefreshToken();
