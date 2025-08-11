const { google } = require('googleapis');
const requestCache = require('../middleware/requestCache');

/**
 * Service para gerenciar agendamentos individuais via Google Calendar
 * Cada usuário tem seus próprios agendamentos (individualizados)
 * Não usa banco de dados, apenas Google Calendar API + cache
 */
class AgendamentoGoogleService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Configura o cliente OAuth com os tokens do usuário
   */
  async configurarClienteUsuario(usuario) {
    if (!usuario.googleAccessToken) {
      throw new Error('Usuário não possui integração com Google Calendar');
    }

    this.oauth2Client.setCredentials({
      access_token: usuario.googleAccessToken,
      refresh_token: usuario.googleRefreshToken
    });

    return google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Lista agendamentos do usuário (apenas os próprios)
   */
  async listarAgendamentos(usuario, filtros = {}) {
    try {
      // Verificar cache primeiro
      const cacheKey = `agendamentos_${usuario.id}_${JSON.stringify(filtros)}`;
      const cacheDados = requestCache.get(cacheKey);
      
      if (cacheDados) {
        console.log('📋 Agendamentos retornados do cache');
        return cacheDados;
      }

      const calendar = await this.configurarClienteUsuario(usuario);

      // Configurar filtros de data
      const agora = new Date();
      const timeMin = filtros.dataInicio || agora.toISOString();
      const timeMax = filtros.dataFim || new Date(agora.getTime() + (90 * 24 * 60 * 60 * 1000)).toISOString(); // 90 dias

      // Buscar eventos no Google Calendar
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin,
        timeMax: timeMax,
        maxResults: filtros.limite || 50,
        singleEvents: true,
        orderBy: 'startTime',
        q: filtros.busca || undefined
      });

      const eventos = response.data.items || [];
      
      // Transformar eventos do Google Calendar para formato do sistema
      const agendamentos = eventos.map(evento => this.transformarEventoParaAgendamento(evento, usuario));

      // Armazenar no cache por 5 minutos
      requestCache.set(cacheKey, agendamentos, 5 * 60 * 1000);

      console.log(`📅 ${agendamentos.length} agendamentos encontrados para usuário ${usuario.nome}`);
      return agendamentos;

    } catch (error) {
      console.error('❌ Erro ao listar agendamentos:', error);
      throw new Error('Erro ao buscar agendamentos do Google Calendar');
    }
  }

  /**
   * Criar novo agendamento (individual)
   */
  async criarAgendamento(usuario, dadosAgendamento) {
    try {
      const calendar = await this.configurarClienteUsuario(usuario);

      // Montar evento do Google Calendar
      const evento = {
        summary: dadosAgendamento.titulo,
        description: this.montarDescricaoEvento(dadosAgendamento, usuario),
        start: {
          dateTime: new Date(dadosAgendamento.dataEvento).toISOString(),
          timeZone: 'America/Sao_Paulo'
        },
        end: {
          dateTime: new Date(new Date(dadosAgendamento.dataEvento).getTime() + (60 * 60 * 1000)).toISOString(), // 1 hora de duração padrão
          timeZone: 'America/Sao_Paulo'
        },
        location: dadosAgendamento.local || undefined,
        reminders: {
          useDefault: false,
          overrides: this.montarLembretes(dadosAgendamento)
        },
        extendedProperties: {
          private: {
            sistemaId: `npj_${usuario.id}_${Date.now()}`,
            tipoEvento: dadosAgendamento.tipoEvento || 'outro',
            processoId: dadosAgendamento.processoId || '',
            criadoPor: usuario.id.toString(),
            sistemaOrigem: 'NPJ'
          }
        }
      };

      // Criar evento no Google Calendar
      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: evento
      });

      const agendamentoCriado = this.transformarEventoParaAgendamento(response.data, usuario);

      // Invalidar cache do usuário
      this.invalidarCacheUsuario(usuario.id);

      console.log(`✅ Agendamento criado para usuário ${usuario.nome}: ${dadosAgendamento.titulo}`);
      return agendamentoCriado;

    } catch (error) {
      console.error('❌ Erro ao criar agendamento:', error);
      throw new Error('Erro ao criar agendamento no Google Calendar');
    }
  }

  /**
   * Atualizar agendamento existente
   */
  async atualizarAgendamento(usuario, googleEventId, dadosAtualizacao) {
    try {
      const calendar = await this.configurarClienteUsuario(usuario);

      // Buscar evento atual
      const eventoAtual = await calendar.events.get({
        calendarId: 'primary',
        eventId: googleEventId
      });

      if (!eventoAtual.data) {
        throw new Error('Agendamento não encontrado');
      }

      // Verificar se o usuário é o criador
      const criadoPor = eventoAtual.data.extendedProperties?.private?.criadoPor;
      if (criadoPor && criadoPor !== usuario.id.toString()) {
        throw new Error('Você não tem permissão para editar este agendamento');
      }

      // Montar dados atualizados
      const eventoAtualizado = {
        ...eventoAtual.data,
        summary: dadosAtualizacao.titulo || eventoAtual.data.summary,
        description: dadosAtualizacao.descricao ? this.montarDescricaoEvento(dadosAtualizacao, usuario) : eventoAtual.data.description,
        location: dadosAtualizacao.local !== undefined ? dadosAtualizacao.local : eventoAtual.data.location
      };

      if (dadosAtualizacao.dataEvento) {
        eventoAtualizado.start.dateTime = new Date(dadosAtualizacao.dataEvento).toISOString();
        eventoAtualizado.end.dateTime = new Date(new Date(dadosAtualizacao.dataEvento).getTime() + (60 * 60 * 1000)).toISOString();
      }

      // Atualizar evento
      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId: googleEventId,
        resource: eventoAtualizado
      });

      // Invalidar cache
      this.invalidarCacheUsuario(usuario.id);

      return this.transformarEventoParaAgendamento(response.data, usuario);

    } catch (error) {
      console.error('❌ Erro ao atualizar agendamento:', error);
      throw new Error('Erro ao atualizar agendamento no Google Calendar');
    }
  }

  /**
   * Excluir agendamento
   */
  async excluirAgendamento(usuario, googleEventId) {
    try {
      const calendar = await this.configurarClienteUsuario(usuario);

      // Verificar se o evento existe e se o usuário pode excluí-lo
      const evento = await calendar.events.get({
        calendarId: 'primary',
        eventId: googleEventId
      });

      const criadoPor = evento.data.extendedProperties?.private?.criadoPor;
      if (criadoPor && criadoPor !== usuario.id.toString()) {
        throw new Error('Você não tem permissão para excluir este agendamento');
      }

      // Excluir evento
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: googleEventId
      });

      // Invalidar cache
      this.invalidarCacheUsuario(usuario.id);

      console.log(`🗑️ Agendamento excluído para usuário ${usuario.nome}`);
      return { sucesso: true, mensagem: 'Agendamento excluído com sucesso' };

    } catch (error) {
      console.error('❌ Erro ao excluir agendamento:', error);
      throw new Error('Erro ao excluir agendamento do Google Calendar');
    }
  }

  /**
   * Buscar agendamento específico
   */
  async buscarAgendamento(usuario, googleEventId) {
    try {
      const calendar = await this.configurarClienteUsuario(usuario);

      const response = await calendar.events.get({
        calendarId: 'primary',
        eventId: googleEventId
      });

      return this.transformarEventoParaAgendamento(response.data, usuario);

    } catch (error) {
      console.error('❌ Erro ao buscar agendamento:', error);
      throw new Error('Agendamento não encontrado');
    }
  }

  /**
   * Transformar evento do Google Calendar para formato do sistema
   */
  transformarEventoParaAgendamento(evento, usuario) {
    const props = evento.extendedProperties?.private || {};
    
    return {
      id: evento.id,
      googleEventId: evento.id,
      titulo: evento.summary || 'Sem título',
      descricao: evento.description || '',
      dataEvento: evento.start?.dateTime || evento.start?.date,
      local: evento.location || '',
      status: evento.status === 'cancelled' ? 'cancelado' : 'agendado',
      tipoEvento: props.tipoEvento || 'outro',
      processoId: props.processoId || null,
      usuarioId: usuario.id,
      criadoPor: parseInt(props.criadoPor) || usuario.id,
      sistemaOrigem: props.sistemaOrigem || 'Google',
      criadoEm: evento.created,
      atualizadoEm: evento.updated,
      // Dados específicos do Google Calendar
      linkGoogleCalendar: evento.htmlLink,
      organizador: evento.organizer?.email,
      participantes: evento.attendees || []
    };
  }

  /**
   * Montar descrição do evento
   */
  montarDescricaoEvento(dados, usuario) {
    let descricao = dados.descricao || '';
    
    descricao += `\n\n--- Informações do Sistema NPJ ---`;
    descricao += `\nCriado por: ${usuario.nome} (${usuario.email})`;
    descricao += `\nTipo: ${dados.tipoEvento || 'Outro'}`;
    
    if (dados.processoId) {
      descricao += `\nProcesso ID: ${dados.processoId}`;
    }
    
    descricao += `\nCriado em: ${new Date().toLocaleString('pt-BR')}`;
    
    return descricao;
  }

  /**
   * Montar lembretes do evento
   */
  montarLembretes(dados) {
    const lembretes = [];
    
    if (dados.lembrete1Dia !== false) {
      lembretes.push({ method: 'email', minutes: 24 * 60 }); // 1 dia
      lembretes.push({ method: 'popup', minutes: 24 * 60 });
    }
    
    if (dados.lembrete2Dias) {
      lembretes.push({ method: 'email', minutes: 2 * 24 * 60 }); // 2 dias
    }
    
    if (dados.lembrete1Semana) {
      lembretes.push({ method: 'email', minutes: 7 * 24 * 60 }); // 1 semana
    }
    
    // Lembrete padrão de 15 minutos
    lembretes.push({ method: 'popup', minutes: 15 });
    
    return lembretes;
  }

  /**
   * Invalidar cache do usuário
   */
  invalidarCacheUsuario(usuarioId) {
    const keys = requestCache.keys().filter(key => key.includes(`agendamentos_${usuarioId}`));
    keys.forEach(key => requestCache.delete(key));
    console.log(`🗑️ Cache invalidado para usuário ${usuarioId} (${keys.length} entradas)`);
  }

  /**
   * Invalidar todo o cache de agendamentos
   */
  invalidarTodoCache() {
    const keys = requestCache.keys().filter(key => key.includes('agendamentos_'));
    keys.forEach(key => requestCache.delete(key));
    console.log(`🗑️ Todo cache de agendamentos invalidado (${keys.length} entradas)`);
  }

  /**
   * Verificar se usuário tem Google Calendar conectado
   */
  verificarConexaoGoogle(usuario) {
    return !!(usuario.googleAccessToken && usuario.googleCalendarConnected);
  }

  /**
   * Obter estatísticas dos agendamentos do usuário
   */
  async obterEstatisticas(usuario) {
    try {
      const agendamentos = await this.listarAgendamentos(usuario, {
        dataInicio: new Date().toISOString(),
        dataFim: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString() // próximos 30 dias
      });

      const hoje = new Date();
      const proximaSeamana = new Date(hoje.getTime() + (7 * 24 * 60 * 60 * 1000));

      return {
        total: agendamentos.length,
        proximaSeamana: agendamentos.filter(a => new Date(a.dataEvento) <= proximaSeamana).length,
        hoje: agendamentos.filter(a => {
          const dataEvento = new Date(a.dataEvento);
          return dataEvento.toDateString() === hoje.toDateString();
        }).length,
        porTipo: agendamentos.reduce((acc, a) => {
          acc[a.tipoEvento] = (acc[a.tipoEvento] || 0) + 1;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      return { total: 0, proximaSeamana: 0, hoje: 0, porTipo: {} };
    }
  }
}

module.exports = new AgendamentoGoogleService();
