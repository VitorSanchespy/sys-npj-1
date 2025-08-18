/**
 * Controller para gerenciamento de eventos
 */
const eventService = require('../services/eventService');
const eventNotificationService = require('../services/eventNotificationService');
const { validationResult } = require('express-validator');
const { isAdmin, isProfessor } = require('../middleware/roleMiddleware');

class EventController {
  /**
   * Criar uma nova solicitação de evento
   * POST /events
   */
  async createEvent(req, res) {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const user = req.user || req.usuario;
      const { title, description, start_at, end_at, participants } = req.body;

      // Criar solicitação de evento
      const event = await eventService.createEventRequest({
        title,
        description,
        start_at,
        end_at,
        participants
      }, user.id);

      // Enviar notificação de aprovação para responsáveis
      try {
        await eventNotificationService.sendApprovalRequest(event);
      } catch (emailError) {
        console.error('Erro ao enviar notificação de aprovação:', emailError);
        // Continua mesmo se houver erro no email
      }

      res.status(201).json({
        success: true,
        message: 'Solicitação de evento criada com sucesso',
        data: event
      });
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Listar eventos do usuário ou todos (se admin/professor)
   * GET /events
   */
  async listEvents(req, res) {
    try {
      const user = req.user || req.usuario;
      const { status, from_date, to_date, limit = 50, offset = 0 } = req.query;

      const filters = {
        status,
        from_date,
        to_date,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      let events;

      // Admin e Professor podem ver todos os eventos
      if (isAdmin(user) || isProfessor(user)) {
        events = await eventService.getAllEvents(filters);
      } else {
        // Outros usuários veem apenas seus eventos
        events = await eventService.getUserEvents(user.id, filters);
      }

      res.json({
        success: true,
        data: events,
        meta: {
          total: events.length,
          limit: filters.limit,
          offset: filters.offset
        }
      });
    } catch (error) {
      console.error('Erro ao listar eventos:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter evento por ID
   * GET /events/:id
   */
  async getEvent(req, res) {
    try {
      const user = req.user || req.usuario;
      const { id } = req.params;

      const event = await eventService.getEventById(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento não encontrado'
        });
      }

      // Verificar permissão
      const canView = (
        isAdmin(user) || 
        isProfessor(user) ||
        event.requester_id === user.id ||
        event.participants.some(p => p.user_id === user.id)
      );

      if (!canView) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      console.error('Erro ao buscar evento:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Aprovar evento
   * POST /events/:id/approve
   */
  async approveEvent(req, res) {
    try {
      const user = req.user || req.usuario;
      const { id } = req.params;

      // Aprovar evento
      const event = await eventService.approveEvent(id, user.id);

      // Enviar notificação de aprovação
      try {
        await eventNotificationService.sendApproved(event);
      } catch (emailError) {
        console.error('Erro ao enviar notificação de aprovação:', emailError);
        // Continua mesmo se houver erro no email
      }

      res.json({
        success: true,
        message: 'Evento aprovado com sucesso',
        data: event
      });
    } catch (error) {
      console.error('Erro ao aprovar evento:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Rejeitar evento
   * POST /events/:id/reject
   */
  async rejectEvent(req, res) {
    try {
      const user = req.user || req.usuario;
      const { id } = req.params;
      const { rejection_reason } = req.body;

      if (!rejection_reason || rejection_reason.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Motivo da rejeição é obrigatório'
        });
      }

      // Rejeitar evento
      const event = await eventService.rejectEvent(id, user.id, rejection_reason.trim());

      // Enviar notificação de rejeição
      try {
        await eventNotificationService.sendRejected(event);
      } catch (emailError) {
        console.error('Erro ao enviar notificação de rejeição:', emailError);
        // Continua mesmo se houver erro no email
      }

      res.json({
        success: true,
        message: 'Evento rejeitado com sucesso',
        data: event
      });
    } catch (error) {
      console.error('Erro ao rejeitar evento:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Cancelar evento
   * POST /events/:id/cancel
   */
  async cancelEvent(req, res) {
    try {
      const user = req.user || req.usuario;
      const { id } = req.params;

      // Cancelar evento
      const event = await eventService.cancelEvent(id, user.id);

      res.json({
        success: true,
        message: 'Evento cancelado com sucesso',
        data: event
      });
    } catch (error) {
      console.error('Erro ao cancelar evento:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter estatísticas de eventos (admin/professor)
   * GET /events/stats
   */
  async getEventStats(req, res) {
    try {
      const user = req.user || req.usuario;

      // Verificar permissão
      if (!isAdmin(user) && !isProfessor(user)) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      // Buscar todos os eventos para estatísticas
      const allEvents = await eventService.getAllEvents();

      const stats = {
        total: allEvents.length,
        by_status: {
          requested: allEvents.filter(e => e.status === 'requested').length,
          approved: allEvents.filter(e => e.status === 'approved').length,
          rejected: allEvents.filter(e => e.status === 'rejected').length,
          canceled: allEvents.filter(e => e.status === 'canceled').length,
          completed: allEvents.filter(e => e.status === 'completed').length
        }
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new EventController();
