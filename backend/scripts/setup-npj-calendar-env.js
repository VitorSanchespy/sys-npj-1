#!/usr/bin/env node

/**
 * Script simplificado de configuração do Google Calendar API
 * Usa credenciais do arquivo .env
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');

// Configurações
const CONFIG_DIR = path.join(__dirname, '../config');
const TOKEN_PATH = path.join(CONFIG_DIR, 'token.json');

// Escopos necessários para o Google Calendar
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

class NPJCalendarSetupEnv {
  constructor() {
    this.oauth2Client = null;
    this.calendar = null;
  }

  async init() {
    console.log('🚀 NPJ Calendar Setup - Usando credenciais do .env\n');

    try {
      // Verificar credenciais do .env
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.log('❌ Credenciais não encontradas no arquivo .env!');
        console.log('\n📋 Certifique-se de que o arquivo .env contém:');
        console.log('GOOGLE_CLIENT_ID=seu_client_id');
        console.log('GOOGLE_CLIENT_SECRET=seu_client_secret');
        console.log('GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback');
        return;
      }

      console.log('✅ Credenciais encontradas no .env');

      // Criar diretório de configuração se não existir
      await this.ensureConfigDir();

      // Configurar OAuth2
      this.setupOAuth2();

      // Verificar se já tem token
      if (fs.existsSync(TOKEN_PATH)) {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
        this.oauth2Client.setCredentials(token);
        
        console.log('✅ Token existente encontrado. Testando conexão...');
        const testResult = await this.testConnection();
        
        if (testResult.success) {
          console.log('🎉 Google Calendar já está configurado e funcionando!');
          await this.showStatus();
          return;
        } else {
          console.log('❌ Token expirado ou inválido. Renovando autorização...');
        }
      }

      // Executar fluxo de autorização
      await this.authorizeApp();

    } catch (error) {
      console.error('❌ Erro na configuração:', error.message);
      process.exit(1);
    }
  }

  async ensureConfigDir() {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
      console.log(`📁 Diretório de configuração criado: ${CONFIG_DIR}`);
    }
  }

  setupOAuth2() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback'
    );

    console.log('🔧 Cliente OAuth2 configurado com credenciais do .env');
  }

  async authorizeApp() {
    return new Promise((resolve, reject) => {
      // Gerar URL de autorização
      const authUrl = this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
      });

      console.log('\n🔐 Autorização necessária!');
      console.log('📋 Passos para autorizar o NPJ Calendar:');
      console.log('1. Abra este link no seu navegador:');
      console.log(`\n${authUrl}\n`);
      console.log('2. Faça login com sua conta Google');
      console.log('3. Autorize o acesso ao Google Calendar');
      console.log('4. Copie o código de autorização');

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question('\n📝 Cole o código de autorização aqui: ', async (code) => {
        rl.close();

        try {
          const { tokens } = await this.oauth2Client.getToken(code);
          this.oauth2Client.setCredentials(tokens);

          // Salvar tokens
          fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
          console.log('✅ Tokens salvos com sucesso!');

          // Testar conexão
          const testResult = await this.testConnection();
          
          if (testResult.success) {
            console.log('🎉 NPJ Google Calendar configurado com sucesso!');
            await this.showStatus();
            resolve();
          } else {
            console.error('❌ Falha no teste de conexão:', testResult.error);
            reject(new Error('Teste de conexão falhou'));
          }
        } catch (error) {
          console.error('❌ Erro ao obter tokens:', error.message);
          if (error.message.includes('invalid_grant')) {
            console.log('\n💡 Dica: O código pode ter expirado. Tente novamente com um código novo.');
          }
          reject(error);
        }
      });
    });
  }

  async testConnection() {
    try {
      this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      // Testar listagem de calendários
      const response = await this.calendar.calendarList.list();
      
      // Verificar calendário principal
      const primaryCalendar = response.data.items?.find(cal => cal.primary);
      
      if (!primaryCalendar) {
        return {
          success: false,
          error: 'Calendário principal não encontrado'
        };
      }

      // Testar criação de evento de teste
      const testEvent = {
        summary: 'NPJ: Teste de Configuração ✅',
        description: 'Evento de teste criado pelo sistema NPJ. Será removido automaticamente em 1 minuto.',
        start: {
          dateTime: new Date(Date.now() + 30000).toISOString(), // 30 segundos no futuro
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: new Date(Date.now() + 90000).toISOString(), // 1.5 minutos no futuro
          timeZone: 'America/Sao_Paulo',
        },
        extendedProperties: {
          shared: {
            'npj_sistema': 'true',
            'npj_test': 'true'
          }
        }
      };

      const eventResponse = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: testEvent,
      });

      console.log(`✅ Evento de teste criado: ${eventResponse.data.htmlLink}`);

      // Aguardar 2 segundos e remover evento de teste
      setTimeout(async () => {
        try {
          await this.calendar.events.delete({
            calendarId: 'primary',
            eventId: eventResponse.data.id,
          });
          console.log('🗑️ Evento de teste removido automaticamente');
        } catch (error) {
          console.warn('⚠️ Erro ao remover evento de teste:', error.message);
        }
      }, 2000);

      return {
        success: true,
        calendar: primaryCalendar,
        testEventId: eventResponse.data.id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async showStatus() {
    try {
      console.log('\n📊 Status da Configuração NPJ Calendar:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Informações do calendário
      const calendarList = await this.calendar.calendarList.list();
      const primaryCalendar = calendarList.data.items?.find(cal => cal.primary);
      
      console.log(`📅 Calendário Principal: ${primaryCalendar?.summary || 'N/A'}`);
      console.log(`📧 Conta Google: ${primaryCalendar?.id || 'N/A'}`);
      console.log(`🌍 Fuso Horário: ${primaryCalendar?.timeZone || 'N/A'}`);
      
      // Verificar eventos NPJ existentes
      const npjEvents = await this.calendar.events.list({
        calendarId: 'primary',
        q: 'NPJ:',
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
        timeMin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias atrás
      });

      console.log(`🗓️  Eventos NPJ no Calendário: ${npjEvents.data.items?.length || 0}`);
      
      if (npjEvents.data.items?.length > 0) {
        console.log('📋 Últimos eventos NPJ:');
        npjEvents.data.items.slice(0, 3).forEach(event => {
          const date = new Date(event.start?.dateTime || event.start?.date).toLocaleDateString('pt-BR');
          console.log(`   • ${event.summary} - ${date}`);
        });
      }
      
      // Configuração
      console.log('\n📁 Configuração:');
      console.log(`✅ Client ID: ${process.env.GOOGLE_CLIENT_ID ? 'Configurado' : 'AUSENTE'}`);
      console.log(`✅ Client Secret: ${process.env.GOOGLE_CLIENT_SECRET ? 'Configurado' : 'AUSENTE'}`);
      console.log(`✅ Redirect URI: ${process.env.GOOGLE_REDIRECT_URI || 'Padrão'}`);
      console.log(`✅ Tokens: ${fs.existsSync(TOKEN_PATH) ? 'Salvos' : 'AUSENTE'}`);
      
      console.log('\n🎯 NPJ Calendar Status:');
      console.log('✅ Autenticação: Configurada e funcionando');
      console.log('✅ Permissões: Calendar API autorizada');
      console.log('✅ Integração: Pronta para uso no sistema');
      console.log('✅ Prefixo NPJ: "NPJ:" será adicionado aos eventos');
      console.log('✅ Fuso Horário: America/Sao_Paulo configurado');
      
      console.log('\n🚀 O sistema NPJ pode agora criar e gerenciar eventos no Google Calendar!');
      console.log('🔗 Teste a integração executando: npm start');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
    } catch (error) {
      console.warn('⚠️  Erro ao obter status detalhado:', error.message);
    }
  }
}

// Executar configuração
if (require.main === module) {
  const setup = new NPJCalendarSetupEnv();
  setup.init().then(() => {
    console.log('\n✅ Configuração do NPJ Calendar concluída!');
    process.exit(0);
  }).catch((error) => {
    console.error('\n❌ Erro na configuração:', error.message);
    process.exit(1);
  });
}

module.exports = NPJCalendarSetupEnv;
