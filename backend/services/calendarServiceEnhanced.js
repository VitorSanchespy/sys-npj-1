const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

class CalendarService {
  constructor() {
    this.calendar = null;
    this.oauth2Client = null;
    this.calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    this.timeZone = process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Sao_Paulo';
    this.isConfigured = false;
    this.initializeCalendar();
  }

  async initializeCalendar() {
    try {
      // Configurar OAuth2 Client
      const credentialsPath = path.join(__dirname, '../config/credentials.json');
      const tokenPath = path.join(__dirname, '../config/token.json');

      if (!fs.existsSync(credentialsPath)) {
        console.warn('🔧 Google Calendar: Configure as credenciais executando: node scripts/setup-google-calendar.js');
        return;
      }

      const credentials = JSON.parse(fs.readFileSync(credentialsPath));
      const { client_secret, client_id, redirect_uris } = credentials.web || credentials.installed;

      this.oauth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
      );

      // Carregar token se existir
      if (fs.existsSync(tokenPath)) {
        const token = JSON.parse(fs.readFileSync(tokenPath));
        this.oauth2Client.setCredentials(token);
        
        // Inicializar Calendar API
        this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
        this.isConfigured = true;
        
        console.log('✅ Google Calendar Service configurado');
      } else {
        console.warn('🔧 Google Calendar: Execute o setup para obter token de acesso');
      }
    } catch (error) {
      console.warn('⚠️ Google Calendar não configurado:', error.message);
    }
  }

  async createEvent({ start, end, summary, description = '', location = '', attendees = [], reminders = {} }) {
    try {
      if (!this.calendar) {
        throw new Error('Google Calendar não está configurado');
      }

      // Formatar participantes
      const formattedAttendees = attendees.map(email => ({
        email: email.trim(),
        responseStatus: 'needsAction'
      }));

      // Configurar lembretes
      const reminderOverrides = [];
      if (reminders.email30min) reminderOverrides.push({ method: 'email', minutes: 30 });
      if (reminders.popup15min) reminderOverrides.push({ method: 'popup', minutes: 15 });
      if (reminders.email1day) reminderOverrides.push({ method: 'email', minutes: 1440 });
      
      // Lembretes padrão se nenhum especificado
      if (reminderOverrides.length === 0) {
        reminderOverrides.push({ method: 'email', minutes: 24 * 60 }); // 1 dia antes
        reminderOverrides.push({ method: 'popup', minutes: 60 }); // 1 hora antes
      }

      const event = {
        summary: summary || 'Agendamento NPJ',
        description,
        location,
        start: {
          dateTime: start.toISOString(),
          timeZone: this.timeZone,
        },
        end: {
          dateTime: end.toISOString(),
          timeZone: this.timeZone,
        },
        attendees: formattedAttendees,
        reminders: {
          useDefault: false,
          overrides: reminderOverrides,
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: this.calendarId,
        resource: event,
        sendUpdates: 'all' // Enviar convites para participantes
      });

      return {
        success: true,
        eventId: response.data.id,
        htmlLink: response.data.htmlLink,
        event: response.data
      };
    } catch (error) {
      console.error('Erro ao criar evento no Google Calendar:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateEvent(googleEventId, { start, end, summary, description, location, attendees, reminders }) {
    try {
      if (!this.calendar) {
        throw new Error('Google Calendar não está configurado');
      }

      // Buscar evento atual
      const currentEvent = await this.calendar.events.get({
        calendarId: this.calendarId,
        eventId: googleEventId,
      });

      // Preparar dados atualizados
      const updatedEvent = {
        ...currentEvent.data,
        summary: summary || currentEvent.data.summary,
        description: description !== undefined ? description : currentEvent.data.description,
        location: location !== undefined ? location : currentEvent.data.location,
      };

      if (start) {
        updatedEvent.start = {
          dateTime: start.toISOString(),
          timeZone: this.timeZone,
        };
      }

      if (end) {
        updatedEvent.end = {
          dateTime: end.toISOString(),
          timeZone: this.timeZone,
        };
      }

      // Atualizar participantes se fornecidos
      if (attendees) {
        updatedEvent.attendees = attendees.map(email => ({
          email: email.trim(),
          responseStatus: 'needsAction'
        }));
      }

      // Atualizar lembretes se fornecidos
      if (reminders) {
        const reminderOverrides = [];
        if (reminders.email30min) reminderOverrides.push({ method: 'email', minutes: 30 });
        if (reminders.popup15min) reminderOverrides.push({ method: 'popup', minutes: 15 });
        if (reminders.email1day) reminderOverrides.push({ method: 'email', minutes: 1440 });
        
        if (reminderOverrides.length > 0) {
          updatedEvent.reminders = {
            useDefault: false,
            overrides: reminderOverrides,
          };
        }
      }

      const response = await this.calendar.events.update({
        calendarId: this.calendarId,
        eventId: googleEventId,
        resource: updatedEvent,
        sendUpdates: 'all' // Notificar participantes sobre mudanças
      });

      return {
        success: true,
        eventId: response.data.id,
        htmlLink: response.data.htmlLink,
        event: response.data
      };
    } catch (error) {
      console.error('Erro ao atualizar evento no Google Calendar:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteEvent(googleEventId) {
    try {
      if (!this.calendar) {
        throw new Error('Google Calendar não está configurado');
      }

      await this.calendar.events.delete({
        calendarId: this.calendarId,
        eventId: googleEventId,
        sendUpdates: 'all' // Notificar participantes sobre cancelamento
      });

      return {
        success: true,
        message: 'Evento deletado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao deletar evento no Google Calendar:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

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
      console.error('Erro ao buscar evento no Google Calendar:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async listEvents(processoId = null, timeMin = null, timeMax = null) {
    try {
      if (!this.calendar) {
        throw new Error('Google Calendar não está configurado');
      }

      const params = {
        calendarId: this.calendarId,
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
      };

      if (timeMin) params.timeMin = timeMin;
      if (timeMax) params.timeMax = timeMax;

      // Se um processo específico for solicitado, filtrar por query
      if (processoId) {
        params.q = `Processo: ${processoId}`;
      }

      const response = await this.calendar.events.list(params);

      return {
        success: true,
        events: response.data.items || []
      };
    } catch (error) {
      console.error('Erro ao listar eventos do Google Calendar:', error.message);
      return {
        success: false,
        error: error.message,
        events: []
      };
    }
  }

  // Método para verificar se o serviço está disponível
  isAvailable() {
    return this.isConfigured && this.calendar !== null;
  }

  // Método para obter URL de autorização (caso necessário)
  getAuthUrl() {
    if (!this.oauth2Client) {
      return null;
    }

    const SCOPES = ['https://www.googleapis.com/auth/calendar'];
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
  }

  // Método para definir token de autorização
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

      return { success: true };
    } catch (error) {
      console.error('Erro ao definir token de autorização:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Método para obter status de configuração
  getStatus() {
    return {
      isConfigured: this.isConfigured,
      hasCredentials: fs.existsSync(path.join(__dirname, '../config/credentials.json')),
      hasToken: fs.existsSync(path.join(__dirname, '../config/token.json')),
      calendarId: this.calendarId,
      timeZone: this.timeZone
    };
  }
}

// Exportar instância singleton
module.exports = new CalendarService();
