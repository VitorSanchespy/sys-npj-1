const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = path.join(__dirname, '../config/token.json');
const CREDENTIALS_PATH = path.join(__dirname, '../config/credentials.json');

/**
 * Script para configurar a autorização do Google Calendar
 * Execute: node scripts/setup-google-calendar.js
 */

async function setupGoogleCalendar() {
  console.log('🔧 Configurando Google Calendar para o NPJ...\n');

  // Verificar se credenciais existem
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('❌ Arquivo credentials.json não encontrado!');
    console.log('📋 Passos para configurar:');
    console.log('1. Acesse: https://console.cloud.google.com/');
    console.log('2. Crie credenciais OAuth2 para aplicação web');
    console.log('3. Baixe o arquivo JSON e salve como config/credentials.json');
    console.log('4. Execute este script novamente\n');
    process.exit(1);
  }

  try {
    // Carregar credenciais
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    const { client_secret, client_id, redirect_uris } = credentials.web || credentials.installed;

    const oAuth2Client = new google.auth.OAuth2(
      client_id, 
      client_secret, 
      redirect_uris[0]
    );

    // Verificar se já existe token
    if (fs.existsSync(TOKEN_PATH)) {
      console.log('✅ Token já existe. Verificando validade...');
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
      oAuth2Client.setCredentials(token);

      // Testar acesso
      const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
      try {
        await calendar.calendarList.list();
        console.log('✅ Token válido! Google Calendar configurado com sucesso.');
        return;
      } catch (error) {
        console.log('⚠️ Token inválido ou expirado. Renovando...');
      }
    }

    // Gerar nova autorização
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    console.log('🔐 Autorizando aplicação no Google Calendar...');
    console.log('📋 Abra este link no seu navegador:');
    console.log(authUrl);
    console.log();

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const code = await new Promise((resolve) => {
      rl.question('🔑 Cole o código de autorização aqui: ', (answer) => {
        rl.close();
        resolve(answer);
      });
    });

    // Trocar código por token
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Salvar token
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    console.log('✅ Token salvo em:', TOKEN_PATH);

    // Testar configuração
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    const calendars = await calendar.calendarList.list();
    
    console.log('\n📅 Calendários disponíveis:');
    calendars.data.items.forEach((cal, index) => {
      console.log(`${index + 1}. ${cal.summary} (${cal.id})`);
    });

    console.log('\n🎉 Google Calendar configurado com sucesso!');
    console.log('💡 O sistema NPJ agora pode criar eventos automaticamente.');

  } catch (error) {
    console.error('❌ Erro na configuração:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Verifique se a Google Calendar API está ativada');
    console.log('- Confirme as URLs de redirecionamento no Google Cloud Console');
    console.log('- Certifique-se que o arquivo credentials.json está correto');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupGoogleCalendar().catch(console.error);
}

module.exports = { setupGoogleCalendar };
