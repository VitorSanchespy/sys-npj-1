#!/usr/bin/env node

/**
 * Script de configuração do Google Calendar API para o Sistema NPJ
 * 
 * Este script configura a integração com o Google Calendar API:
 * 1. Verifica/cria arquivo de credenciais
 * 2. Executa fluxo OAuth2 para autorização
 * 3. Salva tokens de acesso
 * 4. Testa a conexão
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');

// Configurações
const CONFIG_DIR = path.join(__dirname, '../config');
const CREDENTIALS_PATH = path.join(CONFIG_DIR, 'credentials.json');
const TOKEN_PATH = path.join(CONFIG_DIR, 'token.json');

// Escopos necessários para o Google Calendar
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

class NPJCalendarSetup {
  constructor() {
    this.oauth2Client = null;
    this.calendar = null;
  }

  /**
   * Inicializar configuração
   */
  async init() {
    console.log('🚀 NPJ Calendar Setup - Configuração do Google Calendar API\n');

    try {
      // Verificar/criar diretório de configuração
      await this.ensureConfigDir();

      // Verificar credenciais
      if (!fs.existsSync(CREDENTIALS_PATH)) {
        console.log('❌ Arquivo de credenciais não encontrado!');
        console.log('\n📋 Para configurar o Google Calendar API:');
        console.log('1. Acesse: https://console.cloud.google.com/');
        console.log('2. Crie um projeto ou selecione um existente');
        console.log('3. Ative a Google Calendar API');
        console.log('4. Crie credenciais OAuth 2.0');
        console.log('5. Baixe o arquivo JSON e salve como:');
        console.log(`   ${CREDENTIALS_PATH}`);
        console.log('\n⚠️  Configure as credenciais primeiro e execute o script novamente.');
        return;
      }

      // Carregar credenciais
      const credentials = this.loadCredentials();
      if (!credentials) return;

      // Configurar OAuth2
      this.setupOAuth2(credentials);

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

  /**
   * Garantir que o diretório de configuração existe
   */
  async ensureConfigDir() {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
      console.log(`📁 Diretório de configuração criado: ${CONFIG_DIR}`);
    }
  }

  /**
   * Carregar credenciais do arquivo
   */
  loadCredentials() {
    try {
      const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
      
      if (!credentials.web && !credentials.installed) {
        console.error('❌ Formato de credenciais inválido!');
        console.log('💡 Certifique-se de usar credenciais OAuth 2.0 (não chave de API)');
        return null;
      }

      console.log('✅ Credenciais carregadas com sucesso');
      return credentials;
    } catch (error) {
      console.error('❌ Erro ao carregar credenciais:', error.message);
      return null;
    }
  }

  /**
   * Configurar cliente OAuth2
   */
  setupOAuth2(credentials) {
    const { client_secret, client_id, redirect_uris } = credentials.web || credentials.installed;
    
    this.oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    console.log('🔧 Cliente OAuth2 configurado');
  }

  /**
   * Executar fluxo de autorização
   */
  async authorizeApp() {
    return new Promise((resolve, reject) => {
      // Gerar URL de autorização
      const authUrl = this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent' // Força novo refresh token
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
          reject(error);
        }
      });
    });
  }

  /**
   * Testar conexão com Google Calendar
   */
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

      // Testar criação de evento de teste (depois apagar)
      const testEvent = {
        summary: 'NPJ: Teste de Configuração',
        description: 'Evento de teste criado pelo sistema NPJ. Será removido automaticamente.',
        start: {
          dateTime: new Date(Date.now() + 60000).toISOString(), // 1 minuto no futuro
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: new Date(Date.now() + 120000).toISOString(), // 2 minutos no futuro
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

      // Remover evento de teste
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventResponse.data.id,
      });

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

  /**
   * Mostrar status da configuração
   */
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
        maxResults: 5,
        singleEvents: true,
        orderBy: 'startTime',
      });

      console.log(`🗓️  Eventos NPJ no Calendário: ${npjEvents.data.items?.length || 0}`);
      
      // Arquivos de configuração
      console.log('\n📁 Arquivos de Configuração:');
      console.log(`✅ Credenciais: ${fs.existsSync(CREDENTIALS_PATH) ? 'OK' : 'AUSENTE'}`);
      console.log(`✅ Tokens: ${fs.existsSync(TOKEN_PATH) ? 'OK' : 'AUSENTE'}`);
      
      console.log('\n🎯 Configuração NPJ Calendar:');
      console.log('✅ Autenticação: Configurada');
      console.log('✅ Permissões: Calendar API habilitada');
      console.log('✅ Integração: Pronta para uso');
      console.log('✅ Prefixo NPJ: "NPJ:" adicionado aos eventos');
      console.log('✅ Fuso Horário: America/Sao_Paulo');
      
      console.log('\n🚀 O sistema NPJ está pronto para criar e gerenciar eventos no Google Calendar!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
    } catch (error) {
      console.warn('⚠️  Erro ao obter status detalhado:', error.message);
    }
  }
}

// Executar configuração se chamado diretamente
if (require.main === module) {
  const setup = new NPJCalendarSetup();
  setup.init().then(() => {
    console.log('\n✅ Configuração concluída!');
    process.exit(0);
  }).catch((error) => {
    console.error('\n❌ Erro na configuração:', error.message);
    process.exit(1);
  });
}

module.exports = NPJCalendarSetup;
