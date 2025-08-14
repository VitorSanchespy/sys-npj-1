const AgendamentoProcesso = require('../models/agendamentoProcessoModel');
const agendamentoGoogleService = require('../services/agendamentoGoogleService');
const notificationService = require('../services/enhancedNotificationService');
const Processo = require('../models/processoModel');
const { Op } = require('sequelize');

class AgendamentoController {
  // Listar processos disponíveis para agendamento (não concluídos)
  async listarProcessosDisponiveis(req, res) {
    try {
      // Filtra processos ATIVOS (não concluídos e sem data de encerramento)
      const processos = await Processo.findAll({
        where: {
          [Op.and]: [
            { data_encerramento: null },
            { 
              [Op.or]: [
                { status: null },
                { status: { [Op.notIn]: ['concluido', 'encerrado', 'arquivado', 'finalizado'] } }
              ]
            }
          ]
        },
        order: [['criado_em', 'DESC']]
      });
      
      return res.json({
        success: true,
        data: { processos }
      });
    } catch (error) {
      console.error('Erro ao listar processos disponíveis:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
  // Listar todos os agendamentos (apenas do usuário logado)
  async listAll(req, res) {
    try {
      const { page = 1, limit = 20, status, tipo_evento, search } = req.query;

      // Construir filtros
      const where = {
        created_by: req.user.id // Apenas agendamentos do usuário
      };
      
      if (status && ['pendente', 'sincronizado', 'cancelado'].includes(status)) {
        where.status = status;
      }
      if (tipo_evento) {
        where.tipo_evento = tipo_evento;
      }
      if (search) {
        where[Op.or] = [
          { summary: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { '$Processo.numero_processo$': { [Op.like]: `%${search}%` } }
        ];
      }

      // Buscar agendamentos com paginação
      const offset = (page - 1) * limit;
      const { count, rows: agendamentos } = await AgendamentoProcesso.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['start', 'DESC']],
        include: [
          {
            model: Processo,
            as: 'Processo',
            attributes: ['id', 'numero_processo', 'titulo'],
            required: false
          }
        ]
      });

      return res.json({
        success: true,
        data: {
          agendamentos,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          },
          usuario_id: req.user.id
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Listar todos os agendamentos de um processo
  async listByProcesso(req, res) {
    try {
      const { processoId } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      if (!processoId) {
        return res.status(400).json({
          success: false,
          message: 'ID do processo é obrigatório'
        });
      }

      // Construir filtros
      const where = { processo_id: processoId };
      if (status && ['pendente', 'sincronizado', 'cancelado'].includes(status)) {
        where.status = status;
      }

      // Buscar agendamentos com paginação
      const offset = (page - 1) * limit;
      const { count, rows: agendamentos } = await AgendamentoProcesso.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['start', 'ASC']]
      });

      return res.json({
        success: true,
        data: {
          agendamentos,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Erro ao listar agendamentos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Criar novo agendamento (rota global - processo_id no body)
  async createGlobal(req, res) {
    try {
      const { 
        processo_id, processoId,
        start, end, 
        dataInicio, data_inicio, dataEvento, data_evento,
        dataFim, data_fim,
        summary, titulo, 
        description, descricao, 
        location, local, 
        tipo_evento, tipoEvento,
        lembrete_1_dia, lembrete1Dia
      } = req.body;

      // Padronizar campos (frontend pode enviar diferentes nomes)
      const finalProcessoId = processo_id || processoId;
      const finalStart = start || dataInicio || data_inicio || dataEvento || data_evento;
      const finalEnd = end || dataFim || data_fim;
      const finalTitulo = titulo || summary || 'Agendamento NPJ';
      const finalDescricao = descricao || description || '';
      const finalLocal = local || location || '';
      const finalTipo = tipoEvento || tipo_evento || 'Reunião';
      const finalLembrete = lembrete_1_dia || lembrete1Dia || false;

      // Validações básicas
      if (!finalProcessoId) {
        return res.status(400).json({
          success: false,
          message: 'ID do processo é obrigatório'
        });
      }

      if (!finalStart || !finalEnd) {
        return res.status(400).json({
          success: false,
          message: 'Data de início e fim são obrigatórias'
        });
      }

      // Função para converter corretamente data com offset Brasil para UTC
      const parseCorrectUTC = (dateString) => {
        if (typeof dateString === 'string' && dateString.includes('-03:00')) {
          // Para uma string como "2025-08-15T17:40:00-03:00"
          // JavaScript já faz a conversão automática correta
          return new Date(dateString);
        }
        return new Date(dateString);
      };

      const startDate = parseCorrectUTC(finalStart);
      const endDate = parseCorrectUTC(finalEnd);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Datas inválidas'
        });
      }

      if (startDate >= endDate) {
        return res.status(400).json({
          success: false,
          message: 'Data de início deve ser anterior à data de fim'
        });
      }

      if (startDate < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Data de início não pode ser no passado'
        });
      }

      // Verificar se o processo existe e não está concluído
      const processo = await Processo.findByPk(finalProcessoId);
      if (!processo) {
        return res.status(404).json({
          success: false,
          message: 'Processo não encontrado'
        });
      }

      if (processo.status === 'concluido' || processo.data_encerramento) {
        return res.status(400).json({
          success: false,
          message: 'Não é possível agendar para processos concluídos'
        });
      }

      // Criar registro pendente no banco
      const agendamento = await AgendamentoProcesso.create({
        processo_id: finalProcessoId,
        start: startDate,
        end: endDate,
        summary: finalTitulo,
        tipo_evento: finalTipo,
        description: finalDescricao,
        location: finalLocal,
        status: 'pendente',
        created_by: req.user?.id
      });

      // Criar agendamento no Google Calendar do usuário
      try {
        const resultado = await agendamentoGoogleService.criarAgendamento(req.user, {
          titulo: finalTitulo,
          descricao: finalDescricao,
          local: finalLocal,
          dataEvento: startDate.toISOString(),
          dataFim: endDate.toISOString(),
          tipoEvento: finalTipo,
          processoId: finalProcessoId,
          convidados: req.body.attendees || req.body.convidados || ''
        });

        if (resultado.sucesso) {
          // Atualizar com dados do Google Calendar
          await agendamento.update({
            google_event_id: resultado.googleEventId,
            html_link: resultado.linkCalendar,
            attendees: JSON.stringify(resultado.participantes || []),
            status: 'sincronizado'
          });

          return res.status(201).json({
            success: true,
            message: 'Agendamento criado e sincronizado com Google Calendar do usuário',
            data: {
            agendamento: {
              ...agendamento.toJSON(),
              google_event_id: resultado.googleEventId,
              html_link: resultado.linkCalendar,
              status: 'sincronizado'
            },
            googleEvent: {
              id: resultado.googleEventId,
              htmlLink: resultado.linkCalendar
            }
          }
        });
      } else {
        // Falha na sincronização, mas agendamento local foi criado
        return res.status(201).json({
          success: true,
          message: 'Agendamento criado localmente (falha na sincronização com Google Calendar)',
          data: { agendamento },
          warning: resultado.erro
        });
      }

      } catch (googleError) {
        // Se houver erro com Google Calendar, manter agendamento local
        if (googleError.message?.includes('Usuário não possui integração')) {
          return res.status(201).json({
            success: true,
            message: 'Agendamento criado com sucesso. Para sincronizar com Google Calendar, conecte sua conta Google.',
            data: { agendamento },
            warning: 'Google Calendar não conectado'
          });
        } else {
          return res.status(201).json({
            success: true,
            message: 'Agendamento criado localmente (erro na sincronização com Google Calendar)',
            data: { agendamento },
            warning: googleError.message
          });
        }
      }

      // Retornar sucesso mesmo sem sincronização
      return res.status(201).json({
        success: true,
        message: 'Agendamento criado (sem sincronização com Google Calendar)',
        data: { agendamento }
      });

    } catch (error) {
      console.error('Erro ao criar agendamento global:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Criar novo agendamento
  async create(req, res) {
    try {
      const { processoId } = req.params;
      const { start, end, summary, description, location, tipo_evento } = req.body;

      // Validações básicas
      if (!processoId) {
        return res.status(400).json({
          success: false,
          message: 'ID do processo é obrigatório'
        });
      }

      if (!start || !end) {
        return res.status(400).json({
          success: false,
          message: 'Data de início e fim são obrigatórias'
        });
      }

      const startDate = new Date(start);
      const endDate = new Date(end);

      if (startDate >= endDate) {
        return res.status(400).json({
          success: false,
          message: 'Data de início deve ser anterior à data de fim'
        });
      }

      if (startDate < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Data de início não pode ser no passado'
        });
      }

      // Criar registro pendente no banco
      const agendamento = await AgendamentoProcesso.create({
        processo_id: processoId,
        start: startDate,
        end: endDate,
        summary: summary || 'Agendamento NPJ',
        tipo_evento: tipo_evento || 'Reunião',
        description,
        location,
        status: 'pendente',
        created_by: req.user?.id
      });

      // Tentar criar evento no Google Calendar
      if (npjCalendarService.isAvailable()) {
        const calendarResult = await npjCalendarService.createEvent({
          start: startDate,
          end: endDate,
          summary: summary || 'Agendamento NPJ',
          description,
          location,
          processo_id: processoId,
          tipo_evento: tipo_evento || 'Reunião',
          created_by: req.user?.id
        });

        if (calendarResult.success) {
          // Atualizar com ID do Google e status sincronizado
          await agendamento.update({
            google_event_id: calendarResult.eventId,
            status: 'sincronizado'
          });

          return res.status(201).json({
            success: true,
            message: 'Agendamento criado e sincronizado com Google Calendar',
            data: {
              agendamento: {
                ...agendamento.toJSON(),
                google_event_id: calendarResult.eventId,
                status: 'sincronizado'
              },
              googleEvent: {
                id: calendarResult.eventId,
                htmlLink: calendarResult.htmlLink
              }
            }
          });
        } else {
          console.warn('Falha ao sincronizar com Google Calendar:', calendarResult.error);
        }
      }

      // Retornar sucesso mesmo sem sincronização
      return res.status(201).json({
        success: true,
        message: 'Agendamento criado (sem sincronização com Google Calendar)',
        data: { agendamento }
      });

    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Atualizar agendamento existente
  async update(req, res) {
    try {
      const { id } = req.params;
      const { start, end, summary, description, location, tipo_evento } = req.body;

      const agendamento = await AgendamentoProcesso.findByPk(id);
      if (!agendamento) {
        return res.status(404).json({
          success: false,
          message: 'Agendamento não encontrado'
        });
      }

      // Preparar dados de atualização
      const updateData = {};
      if (start) updateData.start = new Date(start);
      if (end) updateData.end = new Date(end);
      if (summary !== undefined) updateData.summary = summary;
      if (tipo_evento !== undefined) updateData.tipo_evento = tipo_evento;
      if (description !== undefined) updateData.description = description;
      if (location !== undefined) updateData.location = location;

      // Validar datas se fornecidas
      if (updateData.start && updateData.end && updateData.start >= updateData.end) {
        return res.status(400).json({
          success: false,
          message: 'Data de início deve ser anterior à data de fim'
        });
      }

      // Atualizar no banco local
      await agendamento.update(updateData);

      // Tentar atualizar no Google Calendar se sincronizado
      if (agendamento.google_event_id) {
        try {
          const resultado = await agendamentoGoogleService.atualizarAgendamento(
            req.user,
            agendamento.google_event_id,
            {
              titulo: updateData.summary || agendamento.summary,
              descricao: updateData.description || agendamento.description,
              local: updateData.location || agendamento.location,
              dataEvento: updateData.start || agendamento.start,
              dataFim: updateData.end || agendamento.end,
              tipoEvento: updateData.tipo_evento || agendamento.tipo_evento,
              convidados: req.body.attendees || req.body.convidados || ''
            }
          );

          if (resultado.sucesso) {
            await agendamento.update({ 
              status: 'sincronizado',
              html_link: resultado.linkCalendar || agendamento.html_link
            });
          } else {
            await agendamento.update({ status: 'pendente' });
          }
        } catch (error) {
          await agendamento.update({ status: 'pendente' });
        }
      }

      const agendamentoAtualizado = await AgendamentoProcesso.findByPk(id);

      return res.json({
        success: true,
        message: 'Agendamento atualizado com sucesso',
        data: { agendamento: agendamentoAtualizado }
      });

    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Remover/cancelar agendamento
  async remove(req, res) {
    try {
      const { id } = req.params;

      const agendamento = await AgendamentoProcesso.findByPk(id);
      if (!agendamento) {
        return res.status(404).json({
          success: false,
          message: 'Agendamento não encontrado'
        });
      }

      // Tentar deletar do Google Calendar se sincronizado
      if (agendamento.google_event_id) {
        try {
          await agendamentoGoogleService.cancelarAgendamento(req.user, agendamento.google_event_id);
        } catch (error) {
          // Se falhar em deletar do Google, continua com cancelamento local
        }
      }

      // Marcar como cancelado ao invés de deletar
      await agendamento.update({ status: 'cancelado' });

      return res.json({
        success: true,
        message: 'Agendamento cancelado com sucesso',
        data: { agendamento }
      });

    } catch (error) {
      console.error('Erro ao remover agendamento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar agendamento específico
  async getById(req, res) {
    try {
      const { id } = req.params;

      const agendamento = await AgendamentoProcesso.findByPk(id);

      if (!agendamento) {
        return res.status(404).json({
          success: false,
          message: 'Agendamento não encontrado'
        });
      }

      return res.json({
        success: true,
        data: { agendamento }
      });

    } catch (error) {
      console.error('Erro ao buscar agendamento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Sincronizar agendamento pendente com Google Calendar
  async sync(req, res) {
    try {
      const { id } = req.params;

      const agendamento = await AgendamentoProcesso.findByPk(id);
      if (!agendamento) {
        return res.status(404).json({
          success: false,
          message: 'Agendamento não encontrado'
        });
      }

      if (agendamento.status === 'sincronizado') {
        return res.json({
          success: true,
          message: 'Agendamento já está sincronizado'
        });
      }

      // Criar agendamento no Google Calendar do usuário
      const resultado = await agendamentoGoogleService.criarAgendamento(req.user, {
        titulo: agendamento.summary,
        descricao: agendamento.description,
        local: agendamento.location,
        dataEvento: agendamento.start,
        dataFim: agendamento.end,
        tipoEvento: agendamento.tipo_evento,
        processoId: agendamento.processo_id
      });

      if (resultado.sucesso) {
        await agendamento.update({
          google_event_id: resultado.googleEventId,
          html_link: resultado.linkCalendar,
          status: 'sincronizado'
        });

        return res.json({
          success: true,
          message: 'Agendamento sincronizado com sucesso',
          data: {
            agendamento,
            googleEvent: {
              id: resultado.googleEventId,
              htmlLink: resultado.linkCalendar
            }
          }
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Falha ao sincronizar com Google Calendar',
          error: resultado.erro
        });
      }

    } catch (error) {
      console.error('Erro ao sincronizar agendamento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Listar agendamentos de um processo específico (apenas do usuário logado)
  async listByProcess(req, res) {
    try {
      const { processoId } = req.params;
      const { includeGoogle = 'true' } = req.query;

      // Buscar agendamentos locais do usuário para este processo
      const agendamentosLocais = await AgendamentoProcesso.findAll({
        where: { 
          processo_id: processoId,
          created_by: req.user.id // Apenas agendamentos do usuário
        },
        order: [['start', 'ASC']]
      });

      let eventos = agendamentosLocais;

      // Se solicitado, buscar também do Google Calendar do usuário
      if (includeGoogle === 'true') {
        try {
          const agendamentosGoogle = await agendamentoGoogleService.listarAgendamentos(req.user, {
            processoId: parseInt(processoId),
            dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            dataFim: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
          });

          if (agendamentosGoogle.sucesso) {
            // Filtrar eventos que não estão na base local
            const localEventIds = new Set(agendamentosLocais.map(a => a.google_event_id).filter(Boolean));
            const eventosGoogle = agendamentosGoogle.agendamentos
              .filter(evento => !localEventIds.has(evento.googleEventId))
              .filter(evento => evento.processoId === parseInt(processoId))
              .map(evento => ({
                id: `google_${evento.googleEventId}`,
                google_event_id: evento.googleEventId,
                processo_id: parseInt(processoId),
                start: evento.dataInicio,
                end: evento.dataFim,
                summary: evento.titulo,
                description: evento.descricao,
                location: evento.local,
                html_link: evento.linkGoogleCalendar,
                status: 'sincronizado',
                tipo_evento: evento.tipoEvento,
                source: 'google_calendar',
                created_by: req.user.id,
                createdAt: evento.criadoEm,
                updatedAt: evento.atualizadoEm
              }));

            eventos = [...agendamentosLocais, ...eventosGoogle];
          }
        } catch (error) {
          // Se falhar no Google Calendar, continua apenas com locais
        }
      }

      // Ordenar por data de início
      eventos.sort((a, b) => new Date(a.start) - new Date(b.start));

      return res.json({
        success: true,
        data: { 
          agendamentos: eventos,
          processo_id: processoId,
          total: eventos.length,
          usuario_id: req.user.id
        }
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Listar todos os eventos NPJ do Google Calendar (global)
  async listNPJEvents(req, res) {
    try {
      const { 
        timeMin = new Date().toISOString(),
        timeMax = null,
        maxResults = 100
      } = req.query;

      if (!npjCalendarService.isAvailable()) {
        return res.status(503).json({
          success: false,
          message: 'Google Calendar não está disponível'
        });
      }

      const calendarResult = await npjCalendarService.listNPJEvents({
        timeMin,
        timeMax,
        maxResults: parseInt(maxResults)
      });

      if (!calendarResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Erro ao buscar eventos NPJ',
          error: calendarResult.error
        });
      }

      // Processar eventos para resposta
      const eventosProcessados = calendarResult.events.map(event => ({
        id: event.id,
        google_event_id: event.id,
        summary: event.summary?.replace('NPJ: ', ''), // Remove prefixo para exibição
        description: event.description,
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        location: event.location,
        html_link: event.htmlLink,
        status: 'sincronizado',
        tipo_evento: event.extendedProperties?.shared?.npj_tipo_evento || 'Evento NPJ',
        processo_id: event.extendedProperties?.shared?.npj_processo_id || null,
        created_by: event.extendedProperties?.shared?.npj_created_by || null,
        attendees: event.attendees || [],
        source: 'google_calendar_npj',
        createdAt: event.created,
        updatedAt: event.updated
      }));

      return res.json({
        success: true,
        message: `${eventosProcessados.length} eventos NPJ encontrados`,
        data: {
          eventos: eventosProcessados,
          total: eventosProcessados.length,
          source: 'google_calendar_npj'
        }
      });

    } catch (error) {
      console.error('Erro ao listar eventos NPJ:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Sincronizar todos os agendamentos pendentes com Google Calendar
  async syncronizeAll(req, res) {
    try {
      if (!npjCalendarService.isAvailable()) {
        return res.status(503).json({
          success: false,
          message: 'Google Calendar não está disponível'
        });
      }

      // Buscar agendamentos pendentes ou sem sincronização
      const agendamentosPendentes = await AgendamentoProcesso.findAll({
        where: {
          [Op.or]: [
            { status: 'pendente' },
            { google_event_id: null }
          ]
        },
        order: [['start', 'ASC']]
      });

      if (agendamentosPendentes.length === 0) {
        return res.json({
          success: true,
          message: 'Não há agendamentos para sincronizar',
          data: { created: 0, updated: 0, errors: 0, total: 0 }
        });
      }

      const results = await npjCalendarService.syncronizeWithDatabase(agendamentosPendentes);

      return res.json({
        success: true,
        message: `Sincronização concluída: ${results.created} criados, ${results.updated} atualizados, ${results.errors} erros`,
        data: results
      });

    } catch (error) {
      console.error('Erro na sincronização geral:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Obter status de configuração do Google Calendar
  async getCalendarStatus(req, res) {
    try {
      const status = npjCalendarService.getStatus();
      
      return res.json({
        success: true,
        data: {
          ...status,
          isAvailable: npjCalendarService.isAvailable()
        }
      });

    } catch (error) {
      console.error('Erro ao obter status do calendar:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}

module.exports = new AgendamentoController();
