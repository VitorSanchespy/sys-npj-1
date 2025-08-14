const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

/**
 * Serviço unificado para integração completa com Google Calendar API
 * - CRUD completo de agendamentos
 * - Flag "NPJ:" para identificar eventos do sistema
 * - Sincronização bidirecional
 * - Notificações e lembretes
 * - Filtro para mostrar apenas eventos NPJ
 */
class NPJCalendarService {
  constructor() {
    this.calendar = null;
    this.oauth2Client = null;
    this.calendarId = 'primary';
    this.timeZone = 'America/Sao_Paulo';
    this.isConfigured = false;
    this.npjPrefix = 'NPJ:'; // Flag para identificar eventos do NPJ
    this.initializeCalendar();
  }

  async initializeCalendar() {
    try {
      // Configurar OAuth2 Client usando credenciais do .env
      const tokenPath = path.join(__dirname, '../config/token.json');

      // Usar credenciais do .env se disponíveis
      const client_id = process.env.GOOGLE_CLIENT_ID;
      const client_secret = process.env.GOOGLE_CLIENT_SECRET;
      const redirect_uri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback';

      if (!client_id || !client_secret) {
        console.warn('🔧 NPJ Calendar: Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no arquivo .env');
        return;
      }

      console.log('✅ NPJ Calendar: Credenciais carregadas do arquivo .env');

      this.oauth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uri
      );

      // Carregar token se existir
      if (fs.existsSync(tokenPath)) {
        const token = JSON.parse(fs.readFileSync(tokenPath));
        this.oauth2Client.setCredentials(token);
        
        // Inicializar Calendar API
        this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
        this.isConfigured = true;
        
        console.log('✅ NPJ Google Calendar Service configurado');
      } else {
        console.warn('🔧 NPJ Calendar: Execute o setup para obter token de acesso');
      }
    } catch (error) {
      console.warn('⚠️ NPJ Calendar não configurado:', error.message);
    }
  }

  /**
   * Criar evento no Google Calendar com flag NPJ para usuário específico
   */
  async createEvent(agendamentoData, userId = null) {
    try {
      if (!this.calendar) {
        throw new Error('Google Calendar não está configurado');
      }

      // Se userId for fornecido, configurar para o usuário específico
      let calendarToUse = this.calendar;
      if (userId) {
        // TODO: Implementar configuração por usuário
        // Por enquanto, usar o calendar padrão
      }

      const summary = `${this.npjPrefix} ${agendamentoData.summary || agendamentoData.titulo}`;
      
      // Preparar dados do evento
      const event = {
        summary,
        description: this.buildEventDescription(agendamentoData),
        location: agendamentoData.location || agendamentoData.local || '',
        start: {
          dateTime: new Date(agendamentoData.start || agendamentoData.dataInicio).toISOString(),
          timeZone: this.timeZone,
        },
        end: {
          dateTime: new Date(agendamentoData.end || agendamentoData.dataFim).toISOString(),
          timeZone: this.timeZone,
        },
        attendees: this.parseAttendees(agendamentoData.attendees),
        reminders: this.parseReminders(agendamentoData.reminders_config),
        // Metadados para identificar como evento NPJ
        extendedProperties: {
          shared: {
            'npj_sistema': 'true',
            'npj_processo_id': agendamentoData.processo_id?.toString() || '',
            'npj_tipo_evento': agendamentoData.tipo_evento || 'Reunião',
            'npj_created_by': agendamentoData.created_by?.toString() || ''
          }
        }
      };

      const response = await this.calendar.events.insert({
        calendarId: this.calendarId,
        resource: event,
        sendUpdates: 'all', // Enviar notificações para participantes
      });

      console.log('✅ Evento NPJ criado com sucesso:', response.data.id);

      return {
        success: true,
        eventId: response.data.id,
        htmlLink: response.data.htmlLink,
        event: response.data
      };
    } catch (error) {
      console.error('❌ Erro ao criar evento no Google Calendar:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Atualizar evento no Google Calendar
   */
  async updateEvent(googleEventId, agendamentoData) {
    try {
      if (!this.calendar) {
        throw new Error('Google Calendar não está configurado');
      }

      console.log('📝 Atualizando evento NPJ no Google Calendar:', googleEventId);

      // Adicionar prefixo NPJ ao título se não existir
      let summary = agendamentoData.summary || agendamentoData.titulo || '';
      if (!summary.startsWith(this.npjPrefix)) {
        summary = `${this.npjPrefix} ${summary}`;
      }

      const event = {
        summary,
        description: this.buildEventDescription(agendamentoData),
        location: agendamentoData.location || agendamentoData.local || '',
        start: {
          dateTime: new Date(agendamentoData.start || agendamentoData.dataInicio).toISOString(),
          timeZone: this.timeZone,
        },
        end: {
          dateTime: new Date(agendamentoData.end || agendamentoData.dataFim).toISOString(),
          timeZone: this.timeZone,
        },
        attendees: this.parseAttendees(agendamentoData.attendees),
        reminders: this.parseReminders(agendamentoData.reminders_config),
        // Manter metadados NPJ
        extendedProperties: {
          shared: {
            'npj_sistema': 'true',
            'npj_processo_id': agendamentoData.processo_id?.toString() || '',
            'npj_tipo_evento': agendamentoData.tipo_evento || 'Reunião',
            'npj_updated_at': new Date().toISOString()
          }
        }
      };

      const response = await this.calendar.events.update({
        calendarId: this.calendarId,
        eventId: googleEventId,
        resource: event,
        sendUpdates: 'all',
      });

      console.log('✅ Evento NPJ atualizado com sucesso');

      return {
        success: true,
        event: response.data
      };
    } catch (error) {
      console.error('❌ Erro ao atualizar evento no Google Calendar:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Deletar evento no Google Calendar
   */
  async deleteEvent(googleEventId) {
    try {
      if (!this.calendar) {
        throw new Error('Google Calendar não está configurado');
      }

      console.log('🗑️ Deletando evento NPJ do Google Calendar:', googleEventId);

      await this.calendar.events.delete({
        calendarId: this.calendarId,
        eventId: googleEventId,
        sendUpdates: 'all',
      });

      console.log('✅ Evento NPJ deletado com sucesso');

      return {
        success: true
      };
    } catch (error) {
      console.error('❌ Erro ao deletar evento do Google Calendar:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Buscar evento específico no Google Calendar
   */
  async getEvent(googleEventId) {
    try {
      if (!this.calendar) {
        throw new Error('Google Calendar não está configurado');
      }

      const response = await this.calendar.events.get({
        calendarId: this.calendarId,
        eventId: googleEventId,
      });

      return {
        success: true,
        event: response.data
      };
    } catch (error) {
      console.error('❌ Erro ao buscar evento no Google Calendar:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Listar apenas eventos NPJ do Google Calendar
   */
  async listNPJEvents(options = {}) {
    try {
      if (!this.calendar) {
        throw new Error('Google Calendar não está configurado');
      }

      console.log('📋 Buscando eventos NPJ no Google Calendar...');

      const {
        timeMin = new Date().toISOString(),
        timeMax = null,
        maxResults = 100,
        orderBy = 'startTime'
      } = options;

      const response = await this.calendar.events.list({
        calendarId: this.calendarId,
        timeMin,
        timeMax,
        maxResults,
        singleEvents: true,
        orderBy,
        q: this.npjPrefix, // Buscar apenas eventos com prefixo NPJ
      });

      // Filtrar apenas eventos realmente do NPJ (com metadados)
      const npjEvents = response.data.items?.filter(event => {
        const isNPJTitle = event.summary?.startsWith(this.npjPrefix);
        const isNPJMeta = event.extendedProperties?.shared?.npj_sistema === 'true';
        return isNPJTitle || isNPJMeta;
      }) || [];

      console.log(`✅ Encontrados ${npjEvents.length} eventos NPJ`);

      return {
        success: true,
        events: npjEvents,
        total: npjEvents.length
      };
    } catch (error) {
      console.error('❌ Erro ao listar eventos NPJ:', error.message);
      return {
        success: false,
        error: error.message,
        events: []
      };
    }
  }

  /**
   * Sincronizar agendamentos do banco com Google Calendar
   */
  async syncronizeWithDatabase(agendamentos = []) {
    try {
      console.log('🔄 Iniciando sincronização com Google Calendar...');
      
      const results = {
        created: 0,
        updated: 0,
        errors: 0,
        total: agendamentos.length
      };

      for (const agendamento of agendamentos) {
        try {
          if (!agendamento.google_event_id) {
            // Criar evento no Google Calendar
            const result = await this.createEvent(agendamento);
            if (result.success) {
              // Atualizar banco de dados com dados do Google Calendar
              agendamento.google_event_id = result.eventId;
              agendamento.html_link = result.htmlLink;
              agendamento.status = 'sincronizado';
              await agendamento.save();
              results.created++;
            } else {
              results.errors++;
            }
          } else {
            // Atualizar evento existente
            const result = await this.updateEvent(agendamento.google_event_id, agendamento);
            if (result.success) {
              agendamento.status = 'sincronizado';
              await agendamento.save();
              results.updated++;
            } else {
              results.errors++;
            }
          }
        } catch (error) {
          console.error('❌ Erro na sincronização do agendamento:', agendamento.id, error.message);
          results.errors++;
        }
      }

      console.log('✅ Sincronização concluída:', results);
      return results;
    } catch (error) {
      console.error('❌ Erro na sincronização geral:', error.message);
      throw error;
    }
  }

  /**
   * Construir descrição do evento com informações do processo
   */
  buildEventDescription(agendamentoData) {
    const parts = [];
    
    if (agendamentoData.description) {
      parts.push(agendamentoData.description);
    }

    if (agendamentoData.processo_id) {
      parts.push(`\n📁 Processo: #${agendamentoData.processo_id}`);
    }

    if (agendamentoData.tipo_evento) {
      parts.push(`📋 Tipo: ${agendamentoData.tipo_evento}`);
    }

    parts.push('\n🏛️ Sistema NPJ - Núcleo de Prática Jurídica');
    
    return parts.join('\n');
  }

  /**
   * Processar lista de participantes
   */
  parseAttendees(attendeesData) {
    try {
      if (!attendeesData) return [];
      
      const attendees = typeof attendeesData === 'string' ? 
        JSON.parse(attendeesData) : attendeesData;
      
      return Array.isArray(attendees) ? attendees : [];
    } catch (error) {
      console.warn('⚠️ Erro ao processar participantes:', error.message);
      return [];
    }
  }

  /**
   * Processar configuração de lembretes
   */
  parseReminders(remindersData) {
    try {
      if (!remindersData) {
        // Configuração padrão NPJ
        return {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 dia antes
            { method: 'popup', minutes: 60 }, // 1 hora antes
            { method: 'popup', minutes: 10 }, // 10 minutos antes
          ],
        };
      }

      const reminders = typeof remindersData === 'string' ? 
        JSON.parse(remindersData) : remindersData;
      
      return reminders;
    } catch (error) {
      console.warn('⚠️ Erro ao processar lembretes:', error.message);
      // Retornar configuração padrão em caso de erro
      return {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 },
        ],
      };
    }
  }

  /**
   * Verificar se o serviço está disponível
   */
  isAvailable() {
    return this.isConfigured && this.calendar !== null;
  }

  /**
   * Obter URL de autorização
   */
  getAuthUrl() {
    if (!this.oauth2Client) {
      return null;
    }

    const SCOPES = ['https://www.googleapis.com/auth/calendar'];
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    });
  }

  /**
   * Definir token de autorização
   */
  async setAuthToken(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      // Salvar token para uso futuro
      const tokenPath = path.join(__dirname, '../config/token.json');
      fs.writeFileSync(tokenPath, JSON.stringify(tokens));

      // Reinicializar serviço
      this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      this.isConfigured = true;

      console.log('✅ NPJ Calendar autorizado com sucesso');

      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao autorizar NPJ Calendar:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obter status de configuração
   */
  getStatus() {
    return {
      isConfigured: this.isConfigured,
      hasCredentials: fs.existsSync(path.join(__dirname, '../config/credentials.json')),
      hasToken: fs.existsSync(path.join(__dirname, '../config/token.json')),
      calendarId: this.calendarId,
      timeZone: this.timeZone,
      npjPrefix: this.npjPrefix
    };
  }
}

// Exportar instância singleton
module.exports = new NPJCalendarService();
