require('dotenv').config();
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const { toGoogleCalendarFormat } = require('../utils/timezone');

class GoogleCalendarService {
  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  // Gerar URL de autorização
  getAuthUrl() {
    try {
      console.log('🔧 Verificando credenciais OAuth2:');
      console.log('  Client ID:', this.oauth2Client._clientId ? 'DEFINIDO' : 'INDEFINIDO');
      console.log('  Client Secret:', this.oauth2Client._clientSecret ? 'DEFINIDO' : 'INDEFINIDO');
      console.log('  Redirect URI:', this.oauth2Client._redirectUri);
      
      if (!this.oauth2Client._clientId || !this.oauth2Client._clientSecret) {
        throw new Error('Credenciais do Google OAuth2 não estão configuradas corretamente');
      }
      
      const scopes = ['https://www.googleapis.com/auth/calendar'];
      const authUrl = this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
      });
      
      console.log('🔗 URL de autorização gerada:', authUrl);
      console.log('🔗 Redirect URI configurado:', process.env.GOOGLE_REDIRECT_URI);
      
      return authUrl;
    } catch (error) {
      console.error('❌ Erro ao gerar URL de autorização:', error);
      throw error;
    }
  }

  // Trocar código por tokens
  async getTokens(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      throw new Error('Erro ao obter tokens: ' + error.message);
    }
  }

  // Criar evento no Google Calendar
  async createEvent(tokens, eventData) {
    try {
      this.oauth2Client.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      // Usar formato específico para Google Calendar com timezone Brasil
      const startFormat = toGoogleCalendarFormat(eventData.dataInicio);
      const endFormat = toGoogleCalendarFormat(eventData.dataFim);

      const event = {
        summary: eventData.titulo,
        description: eventData.descricao,
        start: startFormat,
        end: endFormat,
        location: eventData.local || '',
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 dia antes
            { method: 'popup', minutes: 60 }, // 1 hora antes
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      return response.data;
    } catch (error) {
      throw new Error('Erro ao criar evento: ' + error.message);
    }
  }

  // Listar eventos
  async listEvents(tokens, maxResults = 10) {
    try {
      this.oauth2Client.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items;
    } catch (error) {
      throw new Error('Erro ao listar eventos: ' + error.message);
    }
  }

  // Atualizar evento
  async updateEvent(tokens, eventId, eventData) {
    try {
      this.oauth2Client.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      // Usar formato específico para Google Calendar com timezone Brasil
      const startFormat = toGoogleCalendarFormat(eventData.dataInicio);
      const endFormat = toGoogleCalendarFormat(eventData.dataFim);

      const event = {
        summary: eventData.titulo,
        description: eventData.descricao,
        start: startFormat,
        end: endFormat,
        location: eventData.local || '',
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 dia antes
            { method: 'popup', minutes: 60 }, // 1 hora antes
          ],
        },
      };

      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
      });

      return response.data;
    } catch (error) {
      throw new Error('Erro ao atualizar evento: ' + error.message);
    }
  }

  // Deletar evento
  async deleteEvent(tokens, eventId) {
    try {
      this.oauth2Client.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });

      return { success: true };
    } catch (error) {
      throw new Error('Erro ao deletar evento: ' + error.message);
    }
  }
}

module.exports = new GoogleCalendarService();