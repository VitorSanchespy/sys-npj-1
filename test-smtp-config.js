/**
 * Teste de configuração SMTP
 * Verifica se as variáveis de ambiente estão corretas
 */

// Carregar variáveis de ambiente do arquivo centralizado
require('dotenv').config({ path: require('path').resolve(__dirname, 'env/main.env') });

console.log('🔍 TESTE DE CONFIGURAÇÃO SMTP');
console.log('=' .repeat(50));

console.log('\n📋 Variáveis de ambiente SMTP:');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***definida***' : 'undefined');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

// Testar criação do transporter
console.log('\n🔧 Testando criação do transporter...');
try {
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  console.log('✅ Transporter criado com sucesso');
  console.log('📧 Host configurado:', transporter.options.host);
  console.log('🔌 Porta configurada:', transporter.options.port);
  
  // Verificar configuração
  console.log('\n🔍 Verificando configuração...');
  transporter.verify((error, success) => {
    if (error) {
      console.log('❌ Erro na verificação:', error.message);
      console.log('🔍 Detalhes do erro:', error);
    } else {
      console.log('✅ Configuração SMTP válida!');
    }
  });
  
} catch (error) {
  console.error('❌ Erro ao criar transporter:', error.message);
}

console.log('\n📝 Arquivo de ambiente usado:', require('path').resolve(__dirname, 'env/main.env'));
