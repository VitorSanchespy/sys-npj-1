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
      console.log(`📋 Listando agendamentos para usuário: ${usuario.nome} (ID: ${usuario.id})`);
      
      const calendar = await this.configurarClienteUsuario(usuario);

      // Configurar filtros de data - buscar dos últimos 30 dias até próximos 90 dias
      const agora = new Date();
      const timeMin = filtros.dataInicio || new Date(agora.getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString();
      const timeMax = filtros.dataFim || new Date(agora.getTime() + (90 * 24 * 60 * 60 * 1000)).toISOString();

      console.log(`📅 Buscando eventos entre ${timeMin} e ${timeMax}`);

      // Buscar eventos no Google Calendar
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin,
        timeMax: timeMax,
        maxResults: filtros.limite || 100,
        singleEvents: true,
        orderBy: 'startTime',
        q: filtros.busca || undefined
      });

      const eventos = response.data.items || [];
      console.log(`📋 ${eventos.length} eventos encontrados no Google Calendar`);
      
      // Transformar todos os eventos (não filtrar por sistema)
      const agendamentos = eventos.map(evento => this.transformarEventoParaAgendamento(evento, usuario));

      console.log(`✅ ${agendamentos.length} agendamentos processados para usuário ${usuario.nome}`);
      return agendamentos;

    } catch (error) {
      console.error('❌ Erro ao listar agendamentos:', error);
      throw new Error(`Erro ao buscar agendamentos: ${error.message}`);
    }
  }

  /**
   * Criar novo agendamento (individual)
   */
  async criarAgendamento(usuario, dadosAgendamento) {
    try {
      console.log('📅 Criando agendamento no Google Calendar para:', usuario.nome);
      console.log('📝 Dados:', dadosAgendamento);

      // Sempre usar Google Calendar real
      const calendar = await this.configurarClienteUsuario(usuario);

      // Calcular data de fim (1 hora após início se não especificada)
      const dataInicio = new Date(dadosAgendamento.dataEvento);
      const dataFim = dadosAgendamento.dataFim ? 
        new Date(dadosAgendamento.dataFim) : 
        new Date(dataInicio.getTime() + (60 * 60 * 1000));

      // Montar evento do Google Calendar
      const evento = {
        summary: dadosAgendamento.titulo,
        description: dadosAgendamento.descricao || '',
        start: {
          dateTime: dataInicio.toISOString(),
          timeZone: 'America/Sao_Paulo'
        },
        end: {
          dateTime: dataFim.toISOString(),
          timeZone: 'America/Sao_Paulo'
        },
        location: dadosAgendamento.local || undefined,
        reminders: {
          useDefault: false,
          overrides: this.montarLembretes(dadosAgendamento)
        },
        attendees: [
          {
            email: usuario.email,
            displayName: usuario.nome,
            responseStatus: 'accepted'
          },
          // Adiciona convidados extras (se houver)
          ...((dadosAgendamento.convidados || '')
            .split(',')
            .map(email => email.trim())
            .filter(email => email && email !== usuario.email)
            .map(email => ({ email, responseStatus: 'needsAction' })))
        ],
        extendedProperties: {
          private: {
            sistemaId: `npj_${usuario.id}_${Date.now()}`,
            tipoEvento: dadosAgendamento.tipoEvento || 'outro',
            processoId: (dadosAgendamento.processoId || '').toString(),
            criadoPor: usuario.id.toString(),
            sistemaOrigem: 'NPJ',
            lembrete1Dia: (dadosAgendamento.lembrete1Dia || false).toString(),
            lembrete2Dias: (dadosAgendamento.lembrete2Dias || false).toString(),
            lembrete1Semana: (dadosAgendamento.lembrete1Semana || false).toString()
          }
        }
      };

      console.log('📡 Enviando evento para Google Calendar...');
      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: evento
      });

      console.log('✅ Evento criado no Google Calendar:', response.data.id);

      const agendamentoCriado = this.transformarEventoParaAgendamento(response.data, usuario);

      // Invalidar cache
      this.invalidarCacheUsuario(usuario.id);

      return agendamentoCriado;

    } catch (error) {
      console.error('❌ Erro ao criar agendamento:', error);
      throw new Error(`Erro ao criar agendamento: ${error.message}`);
    }
  }  /**
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
    
    // Extrair datas
    const dataInicio = evento.start?.dateTime || evento.start?.date;
    const dataFim = evento.end?.dateTime || evento.end?.date;
    
    return {
      id: evento.id,
      googleEventId: evento.id,
      titulo: evento.summary || 'Sem título',
      descricao: evento.description || '',
      dataEvento: dataInicio,
      dataInicio: dataInicio,
      data_evento: dataInicio,
      data_inicio: dataInicio,
      dataFim: dataFim,
      data_fim: dataFim,
      local: evento.location || '',
      status: evento.status === 'cancelled' ? 'cancelado' : 'agendado',
      tipoEvento: props.tipoEvento || 'outro',
      tipo_evento: props.tipoEvento || 'outro',
      processoId: props.processoId ? parseInt(props.processoId) : null,
      processo_id: props.processoId ? parseInt(props.processoId) : null,
      usuarioId: usuario.id,
      usuario_id: usuario.id,
      criadoPor: parseInt(props.criadoPor) || usuario.id,
      criado_por: parseInt(props.criadoPor) || usuario.id,
      sistemaOrigem: props.sistemaOrigem || 'Google',
      lembrete1Dia: props.lembrete1Dia === 'true',
      lembrete_1_dia: props.lembrete1Dia === 'true',
      lembrete2Dias: props.lembrete2Dias === 'true',
      lembrete_2_dias: props.lembrete2Dias === 'true',
      lembrete1Semana: props.lembrete1Semana === 'true',
      lembrete_1_semana: props.lembrete1Semana === 'true',
      criadoEm: evento.created,
      criado_em: evento.created,
      atualizadoEm: evento.updated,
      atualizado_em: evento.updated,
      // Dados específicos do Google Calendar
      linkGoogleCalendar: evento.htmlLink,
      organizador: evento.organizer?.email,
      participantes: evento.attendees || [],
      // Campos para compatibilidade frontend
      fonte: 'Google Calendar'
    };
  }

  /**
   * Montar descrição do evento
   */
  montarDescricaoEvento(dados, usuario) {
    // Apenas a descrição fornecida pelo usuário, sem informações extras
    return dados.descricao || '';
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
      // Buscar todos os agendamentos do usuário (últimos 90 dias e próximos 90 dias)
      const agora = new Date();
      const dataInicio = new Date(agora.getTime() - (90 * 24 * 60 * 60 * 1000)).toISOString();
      const dataFim = new Date(agora.getTime() + (90 * 24 * 60 * 60 * 1000)).toISOString();
      const agendamentos = await this.listarAgendamentos(usuario, {
        dataInicio,
        dataFim
      });

      const hoje = new Date();
      const hojeStr = hoje.toISOString().slice(0, 10);
      const prox7dias = new Date(hoje.getTime() + (7 * 24 * 60 * 60 * 1000));

      let total = 0, proximos7 = 0, vencidos = 0, agendados = 0, hojeCount = 0;
      const porTipo = {};

      agendamentos.forEach(a => {
        const dataEvento = new Date(a.dataEvento || a.data_inicio || a.dataInicio);
        total++;
        if (dataEvento < hoje) {
          vencidos++;
        } else {
          agendados++;
        }
        if (dataEvento >= hoje && dataEvento <= prox7dias) {
          proximos7++;
        }
        if (dataEvento.toISOString().slice(0, 10) === hojeStr) {
          hojeCount++;
        }
        const tipo = a.tipoEvento || a.tipo_evento || 'outro';
        porTipo[tipo] = (porTipo[tipo] || 0) + 1;
      });

      return {
        total,
        proximos7,
        vencidos,
        agendados,
        hoje: hojeCount,
        porTipo
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      return { total: 0, proximos7: 0, vencidos: 0, agendados: 0, hoje: 0, porTipo: {} };
    }
  }
}

module.exports = new AgendamentoGoogleService();
