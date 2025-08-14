const { google } = require('googleapis');
const requestCache = require('../middleware/requestCache');

/**
 * Service para gerenciar agendamentos individuais via Google Calendar
 * Cada usuário tem seus próprios agendamentos (individualizados)
 * Não usa banco de dados, apenas Google Calendar API + cache
 * IMPORTANTE: Todos os horários são padronizados para o fuso America/Sao_Paulo
 */
class AgendamentoGoogleService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    // Fuso horário padrão do sistema
    this.timeZone = 'America/Sao_Paulo';
  }

  /**
   * Padroniza uma data para o fuso horário de Brasília
   * Garante que a data seja interpretada sempre como America/Sao_Paulo
   */
  padronizarDataBrasilia(dataString) {
    if (!dataString) return null;
    
    try {
      // Se a data já tem informação de timezone, usar como está
      if (dataString.includes('T') && (dataString.includes('-') || dataString.includes('+'))) {
        const data = new Date(dataString);
        return data.toISOString();
      }
      
      // Se é uma data simples (sem timezone), interpretar como horário de Brasília
      const data = new Date(dataString);
      if (isNaN(data.getTime())) {
        throw new Error('Data inválida');
      }
      
      return data.toISOString();
    } catch (error) {
      console.error('❌ Erro ao padronizar data:', error.message, 'Data:', dataString);
      throw new Error(`Data inválida: ${dataString}`);
    }
  }

  /**
   * Formatar data para exibição no fuso de Brasília
   */
  formatarDataBrasilia(dataISO) {
    if (!dataISO) return null;
    
    try {
      const data = new Date(dataISO);
      return data.toLocaleString('pt-BR', {
        timeZone: this.timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('❌ Erro ao formatar data:', error.message);
      return dataISO;
    }
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
  // Removido console.log
      
      const calendar = await this.configurarClienteUsuario(usuario);

      // Configurar filtros de data - buscar dos últimos 30 dias até próximos 90 dias
      const agora = new Date();
      const timeMin = filtros.dataInicio || new Date(agora.getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString();
      const timeMax = filtros.dataFim || new Date(agora.getTime() + (90 * 24 * 60 * 60 * 1000)).toISOString();

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
  // Removido console.log
      
      // Transformar todos os eventos (não filtrar por sistema)
      const agendamentos = eventos.map(evento => this.transformarEventoParaAgendamento(evento, usuario));

  // Removido console.log
      return agendamentos;

    } catch (error) {
  // Removido console.error
      throw new Error(`Erro ao buscar agendamentos: ${error.message}`);
    }
  }

  /**
   * Criar novo agendamento (individual)
   */
  async criarAgendamento(usuario, dadosAgendamento) {
    try {
      // Sempre usar Google Calendar real
      const calendar = await this.configurarClienteUsuario(usuario);

      // Padronizar datas para o fuso de Brasília
      const dataInicioISO = this.padronizarDataBrasilia(dadosAgendamento.dataEvento);
      const dataInicio = new Date(dataInicioISO);
      
      let dataFimISO;
      if (dadosAgendamento.dataFim) {
        dataFimISO = this.padronizarDataBrasilia(dadosAgendamento.dataFim);
      } else {
        // Calcular 1 hora após o início se não especificada
        dataFimISO = new Date(dataInicio.getTime() + (60 * 60 * 1000)).toISOString();
      }
      const dataFim = new Date(dataFimISO);

      // Montar evento do Google Calendar com timezone explícito
      const evento = {
        summary: dadosAgendamento.titulo,
        description: this.montarDescricaoEvento(dadosAgendamento, usuario),
        start: {
          dateTime: dataInicioISO,
          timeZone: this.timeZone
        },
        end: {
          dateTime: dataFimISO,
          timeZone: this.timeZone
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

  // Removido console.log
      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: evento
      });

  // Removido console.log

      const agendamentoCriado = this.transformarEventoParaAgendamento(response.data, usuario);

      // Invalidar cache
      this.invalidarCacheUsuario(usuario.id);

      return agendamentoCriado;

    } catch (error) {
  // Removido console.error
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

      // Verificar se é um evento do tipo workingLocation (não editável)
      if (eventoAtual.data.eventType === 'workingLocation') {
        throw new Error('Eventos de localização de trabalho não podem ser editados através do sistema');
      }

      // Verificar se o usuário é o criador
      const criadoPor = eventoAtual.data.extendedProperties?.private?.criadoPor;
      if (criadoPor && criadoPor !== usuario.id.toString()) {
        throw new Error('Você não tem permissão para editar este agendamento');
      }

      // Montar dados atualizados (criar novo objeto limpo para evitar conflitos)
      const eventoAtualizado = {
        summary: dadosAtualizacao.titulo || eventoAtual.data.summary,
        description: dadosAtualizacao.descricao ? this.montarDescricaoEvento(dadosAtualizacao, usuario) : (eventoAtual.data.description || ''),
        location: dadosAtualizacao.local !== undefined ? dadosAtualizacao.local : (eventoAtual.data.location || ''),
        start: {
          timeZone: this.timeZone
        },
        end: {
          timeZone: this.timeZone
        }
      };

      // Atualizar datas se fornecidas - sempre padronizar para Brasília
      if (dadosAtualizacao.dataEvento) {
        const dataInicioISO = this.padronizarDataBrasilia(dadosAtualizacao.dataEvento);
        const dataInicio = new Date(dataInicioISO);
        
        let dataFimISO;
        if (dadosAtualizacao.dataFim) {
          dataFimISO = this.padronizarDataBrasilia(dadosAtualizacao.dataFim);
        } else {
          // Se não foi fornecida data fim, calcular 1 hora após o início
          dataFimISO = new Date(dataInicio.getTime() + (60 * 60 * 1000)).toISOString();
        }

        eventoAtualizado.start.dateTime = dataInicioISO;
        eventoAtualizado.end.dateTime = dataFimISO;
      } else {
        // Manter datas originais se não estiver atualizando
        eventoAtualizado.start = eventoAtual.data.start;
        eventoAtualizado.end = eventoAtual.data.end;
      }

      // Atualizar convidados se fornecidos
      if (dadosAtualizacao.convidados !== undefined) {
        eventoAtualizado.attendees = [
          {
            email: usuario.email,
            displayName: usuario.nome,
            responseStatus: 'accepted'
          },
          // Adiciona convidados extras (se houver)
          ...((dadosAtualizacao.convidados || '')
            .split(',')
            .map(email => email.trim())
            .filter(email => email && email !== usuario.email)
            .map(email => ({ email, responseStatus: 'needsAction' })))
        ];
      } else {
        // Manter participantes originais se não estiver atualizando
        eventoAtualizado.attendees = eventoAtual.data.attendees;
      }

      // Preservar propriedades importantes do evento original
      if (eventoAtual.data.extendedProperties) {
        eventoAtualizado.extendedProperties = eventoAtual.data.extendedProperties;
      }

      // Preservar reminders
      if (eventoAtual.data.reminders) {
        eventoAtualizado.reminders = eventoAtual.data.reminders;
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
      console.error('❌ Erro detalhado ao atualizar agendamento no Google Calendar:', {
        message: error.message,
        status: error.code,
        details: error.response?.data || error.errors || error
      });
      
      // Relançar o erro original para manter detalhes
      throw error;
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

  // Removido console.log
      return { sucesso: true, mensagem: 'Agendamento excluído com sucesso' };

    } catch (error) {
  // Removido console.error
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
  // Removido console.error
      throw new Error('Agendamento não encontrado');
    }
  }

  /**
   * Transformar evento do Google Calendar para formato do sistema
   */
  transformarEventoParaAgendamento(evento, usuario) {
    const props = evento.extendedProperties?.private || {};
    
    // Extrair e padronizar datas para o fuso de Brasília
    let dataInicio = evento.start?.dateTime || evento.start?.date;
    let dataFim = evento.end?.dateTime || evento.end?.date;
    
    // Garantir que as datas estejam padronizadas
    if (dataInicio) {
      try {
        dataInicio = new Date(dataInicio).toISOString();
      } catch (error) {
        // Erro ao processar data de início
      }
    }
    
    if (dataFim) {
      try {
        dataFim = new Date(dataFim).toISOString();
      } catch (error) {
        // Erro ao processar data de fim
      }
    }
    
    return {
      id: evento.id,
      googleEventId: evento.id,
      titulo: evento.summary || 'Sem título',
      descricao: evento.description || '',
      // Todas as variações de data padronizadas
      dataEvento: dataInicio,
      dataInicio: dataInicio,
      data_evento: dataInicio,
      data_inicio: dataInicio,
      dataFim: dataFim,
      data_fim: dataFim,
      // Formatações para exibição
      dataFormatada: dataInicio ? this.formatarDataBrasilia(dataInicio) : null,
      dataFimFormatada: dataFim ? this.formatarDataBrasilia(dataFim) : null,
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
      convidados: (evento.attendees || [])
        .filter(attendee => attendee.email !== usuario.email)
        .map(attendee => attendee.email)
        .join(', '),
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
   * Montar descrição formatada do evento para o Google Calendar
   */
  montarDescricaoEvento(dadosAgendamento, usuario) {
    let descricao = dadosAgendamento.descricao || '';
    
    // Adicionar informações do sistema na descrição
    const infoSistema = [
      `📋 Criado por: ${usuario.nome} (${usuario.email})`,
      `🏢 Sistema: NPJ - Núcleo de Prática Jurídica`,
      `📅 Tipo: ${dadosAgendamento.tipoEvento || 'Outros'}`,
    ];
    
    if (dadosAgendamento.processoId) {
      infoSistema.push(`⚖️ Processo ID: ${dadosAgendamento.processoId}`);
    }
    
    infoSistema.push(`🕒 Criado em: ${new Date().toLocaleString('pt-BR', { timeZone: this.timeZone })}`);
    
    if (descricao) {
      return descricao + '\n\n' + '='.repeat(50) + '\n' + infoSistema.join('\n');
    } else {
      return infoSistema.join('\n');
    }
  }

  /**
   * Invalidar cache do usuário
   */
  invalidarCacheUsuario(usuarioId) {
    const keys = requestCache.keys().filter(key => key.includes(`agendamentos_${usuarioId}`));
    keys.forEach(key => requestCache.delete(key));
  // Removido console.log
  }

  /**
   * Invalidar todo o cache de agendamentos
   */
  invalidarTodoCache() {
    const keys = requestCache.keys().filter(key => key.includes('agendamentos_'));
    keys.forEach(key => requestCache.delete(key));
  // Removido console.log
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
  // Removido console.error
      return { total: 0, proximos7: 0, vencidos: 0, agendados: 0, hoje: 0, porTipo: {} };
    }
  }
}

module.exports = new AgendamentoGoogleService();
