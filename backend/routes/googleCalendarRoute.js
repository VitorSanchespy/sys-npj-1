const express = require('express');
const router = express.Router();
const googleCalendarService = require('../services/googleCalendarService');
const { usuarioModel: Usuario } = require('../models/indexModel');
const authMiddleware = require('../middleware/authMiddleware');

// Obter URL de autorização do Google
router.get('/auth-url', authMiddleware, async (req, res) => {
  try {
    console.log('📋 Verificando variáveis de ambiente:');
    console.log('  GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'DEFINIDO' : 'INDEFINIDO');
    console.log('  GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'DEFINIDO' : 'INDEFINIDO');
    console.log('  GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);
    
    console.log('👤 Usuário autenticado:', req.user?.id);
    
    const authUrl = googleCalendarService.getAuthUrl();
    console.log('✅ URL gerada com sucesso');
    res.json({ authUrl });
  } catch (error) {
    console.error('❌ Erro ao gerar URL de autorização:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ erro: error.message });
  }
});

// Callback para receber o código de autorização
router.post('/callback', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ erro: 'Código de autorização não fornecido' });
    }

    // Trocar código por tokens
    const tokens = await googleCalendarService.getTokens(code);
    
    // Salvar tokens no usuário
    await Usuario.update({
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token,
      googleCalendarConnected: true
    }, {
      where: { id: req.user.id }
    });

    res.json({ 
      sucesso: true, 
      mensagem: 'Google Calendar conectado com sucesso!'
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// Verificar status da conexão
router.get('/status', authMiddleware, async (req, res) => {
  try {
    console.log('📊 Verificando status Google Calendar para usuário:', req.user?.id);
    
    if (!req.user || !req.user.id) {
      console.log('❌ Usuário não autenticado');
      return res.status(401).json({ erro: 'Usuário não autenticado' });
    }

    const usuario = await Usuario.findByPk(req.user.id);
    
    if (!usuario) {
      console.log('❌ Usuário não encontrado no banco:', req.user.id);
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    console.log('✅ Status Google Calendar:', usuario.googleCalendarConnected || false);
    res.json({ 
      connected: usuario.googleCalendarConnected || false 
    });
  } catch (error) {
    console.error('❌ Erro na rota /status:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ erro: error.message });
  }
});

// Desconectar Google Calendar
router.post('/disconnect', authMiddleware, async (req, res) => {
  try {
    await Usuario.update({
      googleAccessToken: null,
      googleRefreshToken: null,
      googleCalendarConnected: false
    }, {
      where: { id: req.user.id }
    });

    res.json({ 
      sucesso: true, 
      mensagem: 'Google Calendar desconectado com sucesso!'
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// Listar eventos do Google Calendar
router.get('/events', authMiddleware, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.id);
    
    if (!usuario.googleCalendarConnected) {
      return res.status(400).json({ erro: 'Google Calendar não conectado' });
    }

    const tokens = {
      access_token: usuario.googleAccessToken,
      refresh_token: usuario.googleRefreshToken
    };

    const events = await googleCalendarService.listEvents(tokens);
    res.json(events);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;
