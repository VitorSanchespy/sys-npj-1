/**
 * Service unificado para agendamentos individuais
 * Modo DEV: Simula agendamentos com persistência em arquivo
 * Modo PROD: Integração real com Google Calendar
 */
class AgendamentoService {

  /**
   * Excluir agendamento
   */
  async excluirAgendamento(usuario, agendamentoId) {
    if (process.env.NODE_ENV === 'development') {
      const antes = AgendamentoService._agendamentosDev.length;
      AgendamentoService._agendamentosDev = AgendamentoService._agendamentosDev.filter(
        a => !(a.id === agendamentoId && a.usuarioId === usuario.id)
      );
      AgendamentoService._saveDev();
      const depois = AgendamentoService._agendamentosDev.length;
      
      if (depois < antes) {
        console.log('🗑️ [DEV MODE] Agendamento excluído:', agendamentoId);
        return { sucesso: true, mensagem: 'Agendamento excluído com sucesso' };
      } else {
        throw new Error('Agendamento não encontrado para exclusão');
      }
    }
    throw new Error('Integração com Google Calendar não implementada para produção');
  }
  
  /**
   * Verificar se usuário tem Google Calendar conectado
   */
  verificarConexaoGoogle(usuario) {
    if (process.env.NODE_ENV === 'development') {
      return true; // Sempre conectado em dev
    }
    return !!(usuario && usuario.googleAccessToken && usuario.googleCalendarConnected);
  }

  // Array em memória para simular agendamentos em dev
  static _agendamentosDev = require('./agendamentoDevStorage').loadAgendamentos();
  
  static _saveDev() {
    require('./agendamentoDevStorage').saveAgendamentos(AgendamentoService._agendamentosDev);
  }

  /**
   * Lista agendamentos do usuário
   */
  async listarAgendamentos(usuario, filtros = {}) {
    if (process.env.NODE_ENV === 'development') {
      return this._listarAgendamentosDev(usuario, filtros);
    }
    // Em produção, usar Google Calendar real
    throw new Error('Integração com Google Calendar não implementada para produção');
  }

  /**
   * Lista agendamentos em modo desenvolvimento
   */
  _listarAgendamentosDev(usuario, filtros = {}) {
    // Filtrar por usuário
    let ags = AgendamentoService._agendamentosDev.filter(a => a.usuarioId === usuario.id);
    
    // Aplicar filtros opcionais
    if (filtros.dataInicio) {
      ags = ags.filter(a => new Date(a.data_inicio) >= new Date(filtros.dataInicio));
    }
    if (filtros.dataFim) {
      ags = ags.filter(a => new Date(a.data_fim) <= new Date(filtros.dataFim));
    }
    if (filtros.busca) {
      ags = ags.filter(a => (a.titulo || '').toLowerCase().includes(filtros.busca.toLowerCase()));
    }
    
    console.log('📋 Listando agendamentos simulados (dev):', ags.length);
    return ags;
  }

  /**
   * Criar novo agendamento
   */
  async criarAgendamento(usuario, dadosAgendamento) {
    if (process.env.NODE_ENV === 'development') {
      return this._criarAgendamentoDev(usuario, dadosAgendamento);
    }
    // Em produção, usar Google Calendar real
    throw new Error('Integração com Google Calendar não implementada para produção');
  }

  /**
   * Criar agendamento em modo desenvolvimento
   */
  _criarAgendamentoDev(usuario, dadosAgendamento) {
    // Garantir campos de data válidos
    const agora = new Date();
    let dataInicio = dadosAgendamento.data_inicio || dadosAgendamento.dataEvento || agora.toISOString();
    let dataFim = dadosAgendamento.data_fim;
    
    // Se data_fim não veio, calcular 1h após dataInicio
    if (!dataFim) {
      try {
        dataFim = new Date(new Date(dataInicio).getTime() + 60*60*1000).toISOString();
      } catch {
        dataFim = new Date(agora.getTime() + 60*60*1000).toISOString();
      }
    }
    
    // Garantir formato ISO válido
    try {
      dataInicio = new Date(dataInicio).toISOString();
    } catch {
      dataInicio = agora.toISOString();
    }
    try {
      dataFim = new Date(dataFim).toISOString();
    } catch {
      dataFim = new Date(agora.getTime() + 60*60*1000).toISOString();
    }
    
    const novo = {
      id: 'fake-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      titulo: dadosAgendamento.titulo || 'Sem título',
      descricao: dadosAgendamento.descricao || '',
      dataEvento: dataInicio,
      data_inicio: dataInicio,
      data_fim: dataFim,
      tipoEvento: dadosAgendamento.tipoEvento || dadosAgendamento.tipo_evento || 'outro',
      local: dadosAgendamento.local || '',
      processoId: dadosAgendamento.processoId || dadosAgendamento.processo_id || null,
      usuarioId: usuario.id,
      criadoEm: agora.toISOString(),
      atualizadoEm: agora.toISOString(),
      status: 'agendado',
      lembrete1Dia: dadosAgendamento.lembrete1Dia !== false,
      lembrete2Dias: dadosAgendamento.lembrete2Dias || false,
      lembrete1Semana: dadosAgendamento.lembrete1Semana || false,
      mensagem: '[DEV MODE] Agendamento simulado com sucesso.'
    };
    
    AgendamentoService._agendamentosDev.push(novo);
    AgendamentoService._saveDev();
    console.log('⚠️ [DEV MODE] Agendamento criado:', novo);
    return novo;
  }

  /**
   * Buscar agendamento específico
   */
  async buscarAgendamento(usuario, agendamentoId) {
    if (process.env.NODE_ENV === 'development') {
      const agendamento = AgendamentoService._agendamentosDev.find(
        a => a.id === agendamentoId && a.usuarioId === usuario.id
      );
      if (!agendamento) {
        throw new Error('Agendamento não encontrado');
      }
      return agendamento;
    }
    throw new Error('Integração com Google Calendar não implementada para produção');
  }

  /**
   * Atualizar agendamento
   */
  async atualizarAgendamento(usuario, agendamentoId, dadosAtualizacao) {
    if (process.env.NODE_ENV === 'development') {
      return this._atualizarAgendamentoDev(usuario, agendamentoId, dadosAtualizacao);
    }
    throw new Error('Integração com Google Calendar não implementada para produção');
  }

  /**
   * Atualizar agendamento em modo desenvolvimento
   */
  _atualizarAgendamentoDev(usuario, agendamentoId, dadosAtualizacao) {
    const index = AgendamentoService._agendamentosDev.findIndex(
      a => a.id === agendamentoId && a.usuarioId === usuario.id
    );
    
    if (index === -1) {
      throw new Error('Agendamento não encontrado para atualização');
    }
    
    const agendamentoAtual = AgendamentoService._agendamentosDev[index];
    
    // Atualizar campos
    const agendamentoAtualizado = {
      ...agendamentoAtual,
      titulo: dadosAtualizacao.titulo || agendamentoAtual.titulo,
      descricao: dadosAtualizacao.descricao || agendamentoAtual.descricao,
      local: dadosAtualizacao.local !== undefined ? dadosAtualizacao.local : agendamentoAtual.local,
      tipoEvento: dadosAtualizacao.tipoEvento || dadosAtualizacao.tipo_evento || agendamentoAtual.tipoEvento,
      atualizadoEm: new Date().toISOString()
    };
    
    // Atualizar datas se fornecidas
    if (dadosAtualizacao.data_inicio || dadosAtualizacao.data_evento) {
      const novaDataInicio = dadosAtualizacao.data_inicio || dadosAtualizacao.data_evento;
      try {
        agendamentoAtualizado.dataEvento = new Date(novaDataInicio).toISOString();
        agendamentoAtualizado.data_inicio = agendamentoAtualizado.dataEvento;
      } catch {
        // Manter data atual se inválida
      }
    }
    
    if (dadosAtualizacao.data_fim) {
      try {
        agendamentoAtualizado.data_fim = new Date(dadosAtualizacao.data_fim).toISOString();
      } catch {
        // Manter data atual se inválida
      }
    }
    
    AgendamentoService._agendamentosDev[index] = agendamentoAtualizado;
    AgendamentoService._saveDev();
    console.log('✅ [DEV MODE] Agendamento atualizado:', agendamentoAtualizado);
    return agendamentoAtualizado;
  }

  /**
   * Invalidar cache do usuário
   */
  invalidarCacheUsuario(usuarioId) {
    console.log(`🔄 Cache invalidado para usuário ${usuarioId} (modo dev)`);
  }

  /**
   * Obter estatísticas dos agendamentos do usuário
   */
  async obterEstatisticas(usuario) {
    if (process.env.NODE_ENV === 'development') {
      const agendamentos = this._listarAgendamentosDev(usuario, {});
      const hoje = new Date();
      const proximaSeamana = new Date(hoje.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      return {
        total: agendamentos.length,
        proximaSeamana: agendamentos.filter(a => new Date(a.data_inicio) <= proximaSeamana).length,
        hoje: agendamentos.filter(a => {
          const dataEvento = new Date(a.data_inicio);
          return dataEvento.toDateString() === hoje.toDateString();
        }).length,
        porTipo: agendamentos.reduce((acc, a) => {
          acc[a.tipoEvento] = (acc[a.tipoEvento] || 0) + 1;
          return acc;
        }, {})
      };
    }
    
    return {
      total: 0,
      proximaSeamana: 0,
      hoje: 0,
      porTipo: {}
    };
  }
}

module.exports = new AgendamentoService();
