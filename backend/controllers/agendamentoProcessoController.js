const AgendamentoProcesso = require('../models/agendamentoProcessoModel');
const calendarService = require('../services/calendarService');

class AgendamentoController {
  // Listar todos os agendamentos (página global)
  async listAll(req, res) {
    try {
      const { page = 1, limit = 20, status, tipo_evento } = req.query;

      // Construir filtros
      const where = {};
      if (status && ['pendente', 'sincronizado', 'cancelado'].includes(status)) {
        where.status = status;
      }
      if (tipo_evento) {
        where.tipo_evento = tipo_evento;
      }

      // Buscar agendamentos com paginação
      const offset = (page - 1) * limit;
      const { count, rows: agendamentos } = await AgendamentoProcesso.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['start', 'DESC']],
        include: [
          // Incluir dados do processo se disponível
          // AgendamentoProcesso.belongsTo será habilitado quando necessário
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
          }
        }
      });
    } catch (error) {
      console.error('Erro ao listar todos os agendamentos:', error);
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
      if (calendarService.isAvailable()) {
        const calendarResult = await calendarService.createEvent({
          start: startDate,
          end: endDate,
          summary: summary || 'Agendamento NPJ',
          description: `${tipo_evento || 'Reunião'} - Processo: ${processoId}\n\n${description || ''}`,
          location
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
      if (agendamento.google_event_id && calendarService.isAvailable()) {
        const calendarResult = await calendarService.updateEvent(
          agendamento.google_event_id,
          {
            start: updateData.start || agendamento.start,
            end: updateData.end || agendamento.end,
            summary: updateData.summary || agendamento.summary,
            description: `${updateData.tipo_evento || agendamento.tipo_evento || 'Reunião'} - Processo: ${agendamento.processo_id}\n\n${updateData.description || agendamento.description || ''}`,
            location: updateData.location || agendamento.location
          }
        );

        if (calendarResult.success) {
          await agendamento.update({ status: 'sincronizado' });
        } else {
          console.warn('Falha ao atualizar Google Calendar:', calendarResult.error);
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
      if (agendamento.google_event_id && calendarService.isAvailable()) {
        const calendarResult = await calendarService.deleteEvent(agendamento.google_event_id);
        
        if (!calendarResult.success) {
          console.warn('Falha ao deletar do Google Calendar:', calendarResult.error);
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

      if (!calendarService.isAvailable()) {
        return res.status(503).json({
          success: false,
          message: 'Google Calendar não está disponível'
        });
      }

      const calendarResult = await calendarService.createEvent({
        start: agendamento.start,
        end: agendamento.end,
        summary: agendamento.summary
      });

      if (calendarResult.success) {
        await agendamento.update({
          google_event_id: calendarResult.eventId,
          status: 'sincronizado'
        });

        return res.json({
          success: true,
          message: 'Agendamento sincronizado com sucesso',
          data: {
            agendamento,
            googleEvent: {
              id: calendarResult.eventId,
              htmlLink: calendarResult.htmlLink
            }
          }
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Falha ao sincronizar com Google Calendar',
          error: calendarResult.error
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
}

module.exports = new AgendamentoController();
