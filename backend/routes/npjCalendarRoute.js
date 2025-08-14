const express = require('express');
const router = express.Router();
const npjCalendarService = require('../services/npjCalendarService');
const AgendamentoProcesso = require('../models/agendamentoProcessoModel');
const authMiddleware = require('../middleware/authMiddleware');
const { Op } = require('sequelize');

// Middleware de autenticação
router.use(authMiddleware);

/**
 * @route GET /api/npj-calendar/status
 * @desc Obter status completo da configuração NPJ Calendar
 * @access Private
 */
router.get('/status', async (req, res) => {
  try {
    const status = npjCalendarService.getStatus();
    
    // Contar agendamentos locais por status
    const agendamentosStats = await AgendamentoProcesso.findAll({
      attributes: [
        'status',
        [AgendamentoProcesso.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const stats = {
      pendente: 0,
      sincronizado: 0,
      cancelado: 0
    };

    agendamentosStats.forEach(stat => {
      if (stats.hasOwnProperty(stat.status)) {
        stats[stat.status] = parseInt(stat.count);
      }
    });

    return res.json({
      success: true,
      data: {
        googleCalendar: {
          ...status,
          isAvailable: npjCalendarService.isAvailable()
        },
        agendamentos: {
          local: stats,
          total: Object.values(stats).reduce((sum, count) => sum + count, 0)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao obter status NPJ Calendar:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route GET /api/npj-calendar/events
 * @desc Listar todos os eventos NPJ do Google Calendar
 * @access Private
 */
router.get('/events', async (req, res) => {
  try {
    const { 
      timeMin = new Date().toISOString(),
      timeMax = null,
      maxResults = 50
    } = req.query;

    if (!npjCalendarService.isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'Google Calendar não está configurado'
      });
    }

    const result = await npjCalendarService.listNPJEvents({
      timeMin,
      timeMax,
      maxResults: parseInt(maxResults)
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar eventos NPJ',
        error: result.error
      });
    }

    // Processar eventos para resposta
    const eventos = result.events.map(event => ({
      id: event.id,
      google_event_id: event.id,
      summary: event.summary?.replace('NPJ: ', ''),
      description: event.description,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      location: event.location,
      html_link: event.htmlLink,
      status: 'sincronizado',
      tipo_evento: event.extendedProperties?.shared?.npj_tipo_evento || 'Evento NPJ',
      processo_id: event.extendedProperties?.shared?.npj_processo_id || null,
      attendees: event.attendees || [],
      reminders: event.reminders || {},
      source: 'google_calendar_npj',
      created: event.created,
      updated: event.updated
    }));

    return res.json({
      success: true,
      message: `${eventos.length} eventos NPJ encontrados`,
      data: {
        eventos,
        total: eventos.length,
        timeRange: {
          from: timeMin,
          to: timeMax || 'indefinido'
        }
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
});

/**
 * @route POST /api/npj-calendar/sync
 * @desc Sincronizar agendamentos locais com Google Calendar
 * @access Private
 */
router.post('/sync', async (req, res) => {
  try {
    if (!npjCalendarService.isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'Google Calendar não está configurado'
      });
    }

    const { forceSync = false } = req.body;

    // Buscar agendamentos para sincronizar
    const whereClause = forceSync 
      ? {} // Todos os agendamentos se forceSync=true
      : {
          [Op.or]: [
            { status: 'pendente' },
            { google_event_id: null }
          ]
        };

    const agendamentos = await AgendamentoProcesso.findAll({
      where: whereClause,
      order: [['start', 'ASC']]
    });

    if (agendamentos.length === 0) {
      return res.json({
        success: true,
        message: 'Não há agendamentos para sincronizar',
        data: { created: 0, updated: 0, errors: 0, total: 0 }
      });
    }

    console.log(`🔄 Iniciando sincronização de ${agendamentos.length} agendamentos...`);

    const results = await npjCalendarService.syncronizeWithDatabase(agendamentos);

    return res.json({
      success: true,
      message: `Sincronização concluída: ${results.created} criados, ${results.updated} atualizados, ${results.errors} erros`,
      data: results
    });
  } catch (error) {
    console.error('Erro na sincronização:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route POST /api/npj-calendar/test
 * @desc Testar conexão e criar evento de teste
 * @access Private
 */
router.post('/test', async (req, res) => {
  try {
    if (!npjCalendarService.isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'Google Calendar não está configurado'
      });
    }

    // Criar evento de teste
    const testEventData = {
      summary: 'Teste NPJ Calendar',
      description: 'Evento de teste criado pelo sistema NPJ. Pode ser removido.',
      start: new Date(Date.now() + 60 * 60 * 1000), // 1 hora no futuro
      end: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas no futuro
      location: 'Sistema NPJ - Teste',
      tipo_evento: 'Teste',
      processo_id: null,
      created_by: req.user?.id
    };

    const result = await npjCalendarService.createEvent(testEventData);

    if (result.success) {
      return res.json({
        success: true,
        message: 'Teste realizado com sucesso! Evento de teste criado no Google Calendar.',
        data: {
          testEvent: {
            id: result.eventId,
            htmlLink: result.htmlLink,
            summary: testEventData.summary,
            start: testEventData.start,
            end: testEventData.end
          }
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Falha no teste de conexão',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Erro no teste NPJ Calendar:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/npj-calendar/events/:eventId
 * @desc Deletar evento NPJ específico do Google Calendar
 * @access Private
 */
router.delete('/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!npjCalendarService.isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'Google Calendar não está configurado'
      });
    }

    const result = await npjCalendarService.deleteEvent(eventId);

    if (result.success) {
      // Atualizar agendamento local se existir
      const agendamento = await AgendamentoProcesso.findOne({
        where: { google_event_id: eventId }
      });

      if (agendamento) {
        await agendamento.update({ status: 'cancelado' });
      }

      return res.json({
        success: true,
        message: 'Evento NPJ removido do Google Calendar',
        data: { eventId }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Falha ao remover evento',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Erro ao remover evento NPJ:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route GET /api/npj-calendar/config
 * @desc Obter informações de configuração para setup
 * @access Private (admin only)
 */
router.get('/config', async (req, res) => {
  try {
    // Verificar se usuário é admin (implementar verificação se necessário)
    const status = npjCalendarService.getStatus();
    
    return res.json({
      success: true,
      data: {
        status,
        setup: {
          credentialsPath: '../config/credentials.json',
          tokenPath: '../config/token.json',
          setupScript: 'node scripts/setup-npj-calendar.js',
          requiredScopes: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events'
          ]
        },
        instructions: {
          step1: 'Configure credenciais OAuth2 no Google Cloud Console',
          step2: 'Baixe o arquivo credentials.json para backend/config/',
          step3: 'Execute: npm run setup-calendar',
          step4: 'Autorize o acesso quando solicitado'
        }
      }
    });
  } catch (error) {
    console.error('Erro ao obter configuração:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

module.exports = router;
