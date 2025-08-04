// Teste direto do modelo de notificação
require('dotenv').config();

async function testNotificationModel() {
  try {
    console.log('🔍 Carregando configuração do banco...');
    const sequelize = require('./backend/utils/sequelize');
    
    console.log('🔍 Testando conexão...');
    await sequelize.authenticate();
    console.log('✅ Conexão OK');
    
    console.log('🔍 Carregando modelo Notificacao...');
    const Notificacao = require('./backend/models/notificacaoModel');
    console.log('✅ Modelo carregado:', !!Notificacao);
    
    console.log('🔍 Testando count...');
    const count = await Notificacao.count({
      where: { 
        usuario_id: 4, 
        status: ['pendente', 'enviado']
      }
    });
    
    console.log('✅ Count resultado:', count);
    
    console.log('🔍 Listando todas as notificações do usuário 4...');
    const notificacoes = await Notificacao.findAll({
      where: { usuario_id: 4 }
    });
    
    console.log('✅ Notificações encontradas:', notificacoes.length);
    notificacoes.forEach(n => {
      console.log(`- ID: ${n.id}, Status: ${n.status}, Título: ${n.titulo}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
    console.error('❌ Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

testNotificationModel();
