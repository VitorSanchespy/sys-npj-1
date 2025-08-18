/**
 * Service para gerenciamento de eventos
 */
const { eventModel: Event, eventParticipantModel: EventParticipant, usuarioModel: Usuario } = require('../models/indexModel');
const { Op } = require('sequelize');
const dateUtils = require('../utils/date');

class EventService {
  /**
   * Criar uma nova solicitação de evento
   */
  async createEventRequest(requestData, requesterId) {
    try {
      const { title, description, start_at, end_at, participants = [] } = requestData;

      // Validar datas
      if (!dateUtils.isFuture(start_at)) {
        throw new Error('Data de início deve ser no futuro');
      }

      if (new Date(end_at) <= new Date(start_at)) {
        throw new Error('Data de fim deve ser posterior à data de início');
      }

      // Criar evento
      const event = await Event.create({
        title,
        description,
        start_at: dateUtils.formatISO(start_at),
        end_at: dateUtils.formatISO(end_at),
        status: 'requested',
        requester_id: requesterId
      });

      // Adicionar participantes se fornecidos
      if (participants && participants.length > 0) {
        const participantsData = await Promise.all(
          participants.map(async (participant) => {
            let user_id = null;
            
            // Tentar encontrar usuário pelo email
            const user = await Usuario.findOne({ where: { email: participant.email } });
            if (user) {
              user_id = user.id;
            }

            return {
              event_id: event.id,
              user_id: user_id,
              email: participant.email
            };
          })
        );

        await EventParticipant.bulkCreate(participantsData);
      }

      // Buscar evento completo com relacionamentos
      return await this.getEventById(event.id);
    } catch (error) {
      throw new Error(`Erro ao criar solicitação de evento: ${error.message}`);
    }
  }

  /**
   * Aprovar um evento
   */
  async approveEvent(eventId, approverId) {
    try {
      const event = await Event.findByPk(eventId);
      
      if (!event) {
        throw new Error('Evento não encontrado');
      }

      if (!event.canBeApproved()) {
        throw new Error('Evento não pode ser aprovado no status atual');
      }

      // Atualizar status do evento
      await event.update({
        status: 'approved',
        approver_id: approverId
      });

      // Buscar evento atualizado com relacionamentos
      return await this.getEventById(eventId);
    } catch (error) {
      throw new Error(`Erro ao aprovar evento: ${error.message}`);
    }
  }

  /**
   * Rejeitar um evento
   */
  async rejectEvent(eventId, approverId, rejectionReason) {
    try {
      const event = await Event.findByPk(eventId);
      
      if (!event) {
        throw new Error('Evento não encontrado');
      }

      if (!event.canBeRejected()) {
        throw new Error('Evento não pode ser rejeitado no status atual');
      }

      // Atualizar status do evento
      await event.update({
        status: 'rejected',
        approver_id: approverId,
        rejection_reason: rejectionReason
      });

      // Buscar evento atualizado com relacionamentos
      return await this.getEventById(eventId);
    } catch (error) {
      throw new Error(`Erro ao rejeitar evento: ${error.message}`);
    }
  }

  /**
   * Cancelar um evento
   */
  async cancelEvent(eventId, userId) {
    try {
      const event = await Event.findByPk(eventId);
      
      if (!event) {
        throw new Error('Evento não encontrado');
      }

      // Verificar se o usuário pode cancelar (solicitante ou admin)
      if (event.requester_id !== userId) {
        // Verificar se é admin (implementar lógica se necessário)
        throw new Error('Apenas o solicitante pode cancelar o evento');
      }

      if (event.status === 'completed' || event.status === 'canceled') {
        throw new Error('Evento não pode ser cancelado no status atual');
      }

      // Atualizar status do evento
      await event.update({
        status: 'canceled'
      });

      // Buscar evento atualizado com relacionamentos
      return await this.getEventById(eventId);
    } catch (error) {
      throw new Error(`Erro ao cancelar evento: ${error.message}`);
    }
  }

  /**
   * Obter evento por ID com relacionamentos
   */
  async getEventById(eventId) {
    try {
      const event = await Event.findByPk(eventId, {
        include: [
          {
            model: Usuario,
            as: 'requester',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: Usuario,
            as: 'approver',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: EventParticipant,
            as: 'participants',
            include: [
              {
                model: Usuario,
                as: 'user',
                attributes: ['id', 'nome', 'email']
              }
            ]
          }
        ]
      });

      return event;
    } catch (error) {
      throw new Error(`Erro ao buscar evento: ${error.message}`);
    }
  }

  /**
   * Listar eventos do usuário (como solicitante ou participante)
   */
  async getUserEvents(userId, filters = {}) {
    try {
      const { status, from_date, to_date, limit = 50, offset = 0 } = filters;

      // Construir condições de busca
      const whereConditions = {};
      
      if (status) {
        whereConditions.status = status;
      }

      if (from_date || to_date) {
        whereConditions.start_at = {};
        if (from_date) whereConditions.start_at[Op.gte] = dateUtils.formatISO(from_date);
        if (to_date) whereConditions.start_at[Op.lte] = dateUtils.formatISO(to_date);
      }

      // Buscar eventos onde o usuário é solicitante
      const requesterEvents = await Event.findAll({
        where: {
          requester_id: userId,
          ...whereConditions
        },
        include: [
          {
            model: Usuario,
            as: 'requester',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: Usuario,
            as: 'approver',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: EventParticipant,
            as: 'participants',
            include: [
              {
                model: Usuario,
                as: 'user',
                attributes: ['id', 'nome', 'email']
              }
            ]
          }
        ],
        order: [['start_at', 'ASC']],
        limit,
        offset
      });

      // Buscar eventos onde o usuário é participante
      const participantEvents = await Event.findAll({
        include: [
          {
            model: Usuario,
            as: 'requester',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: Usuario,
            as: 'approver',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: EventParticipant,
            as: 'participants',
            where: {
              user_id: userId
            },
            include: [
              {
                model: Usuario,
                as: 'user',
                attributes: ['id', 'nome', 'email']
              }
            ]
          }
        ],
        where: whereConditions,
        order: [['start_at', 'ASC']],
        limit,
        offset
      });

      // Combinar e remover duplicatas
      const allEvents = [...requesterEvents, ...participantEvents];
      const uniqueEvents = allEvents.filter((event, index, self) => 
        self.findIndex(e => e.id === event.id) === index
      );

      return uniqueEvents.sort((a, b) => new Date(a.start_at) - new Date(b.start_at));
    } catch (error) {
      throw new Error(`Erro ao listar eventos do usuário: ${error.message}`);
    }
  }

  /**
   * Listar todos os eventos (para admins/professores)
   */
  async getAllEvents(filters = {}) {
    try {
      const { status, from_date, to_date, limit = 50, offset = 0 } = filters;

      // Construir condições de busca
      const whereConditions = {};
      
      if (status) {
        whereConditions.status = status;
      }

      if (from_date || to_date) {
        whereConditions.start_at = {};
        if (from_date) whereConditions.start_at[Op.gte] = dateUtils.formatISO(from_date);
        if (to_date) whereConditions.start_at[Op.lte] = dateUtils.formatISO(to_date);
      }

      const events = await Event.findAll({
        where: whereConditions,
        include: [
          {
            model: Usuario,
            as: 'requester',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: Usuario,
            as: 'approver',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: EventParticipant,
            as: 'participants',
            include: [
              {
                model: Usuario,
                as: 'user',
                attributes: ['id', 'nome', 'email']
              }
            ]
          }
        ],
        order: [['start_at', 'ASC']],
        limit,
        offset
      });

      return events;
    } catch (error) {
      throw new Error(`Erro ao listar todos os eventos: ${error.message}`);
    }
  }

  /**
   * Buscar eventos que precisam ser marcados como completos
   */
  async getEventsToComplete() {
    try {
      const now = new Date();
      
      const events = await Event.findAll({
        where: {
          status: 'approved',
          end_at: {
            [Op.lt]: now
          }
        }
      });

      return events;
    } catch (error) {
      throw new Error(`Erro ao buscar eventos para completar: ${error.message}`);
    }
  }

  /**
   * Marcar eventos como completos
   */
  async markEventsAsCompleted() {
    try {
      const eventsToComplete = await this.getEventsToComplete();
      
      if (eventsToComplete.length > 0) {
        await Event.update(
          { status: 'completed' },
          {
            where: {
              id: {
                [Op.in]: eventsToComplete.map(e => e.id)
              }
            }
          }
        );
      }

      return eventsToComplete.length;
    } catch (error) {
      throw new Error(`Erro ao marcar eventos como completos: ${error.message}`);
    }
  }

  /**
   * Buscar eventos aprovados para hoje (para lembretes diários)
   */
  async getTodayApprovedEvents() {
    try {
      const today = new Date();
      const startOfDay = dateUtils.startOfDay(today);
      const endOfDay = dateUtils.endOfDay(today);

      const events = await Event.findAll({
        where: {
          status: 'approved',
          start_at: {
            [Op.between]: [startOfDay, endOfDay]
          }
        },
        include: [
          {
            model: Usuario,
            as: 'requester',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: EventParticipant,
            as: 'participants',
            include: [
              {
                model: Usuario,
                as: 'user',
                attributes: ['id', 'nome', 'email']
              }
            ]
          }
        ]
      });

      return events;
    } catch (error) {
      throw new Error(`Erro ao buscar eventos de hoje: ${error.message}`);
    }
  }

  /**
   * Buscar eventos que começam em ~60 minutos (para lembretes por hora)
   */
  async getEventsStartingInAnHour() {
    try {
      const now = new Date();
      const in45Minutes = dateUtils.addMinutes(now, 45);
      const in75Minutes = dateUtils.addMinutes(now, 75);

      const events = await Event.findAll({
        where: {
          status: 'approved',
          start_at: {
            [Op.between]: [in45Minutes, in75Minutes]
          }
        },
        include: [
          {
            model: Usuario,
            as: 'requester',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: EventParticipant,
            as: 'participants',
            include: [
              {
                model: Usuario,
                as: 'user',
                attributes: ['id', 'nome', 'email']
              }
            ]
          }
        ]
      });

      return events;
    } catch (error) {
      throw new Error(`Erro ao buscar eventos iniciando em uma hora: ${error.message}`);
    }
  }
}

module.exports = new EventService();
