/**
 * Service temporário para agendamentos individuais
 * Retorna dados vazios até o Google Calendar ser configurado
 */
class AgendamentoTemporarioService {
  
  /**
   * Verificar se usuário tem Google Calendar conectado
   */
  verificarConexaoGoogle(usuario) {
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return !!(usuario && usuario.googleAccessToken && usuario.googleCalendarConnected);
  }

  /**
   * Lista agendamentos do usuário (retorna vazio temporariamente)
   */
  async listarAgendamentos(usuario, filtros = {}) {
    console.log('📋 Retornando agendamentos vazios - Google Calendar não configurado');
    return [];
  }

  /**
   * Criar novo agendamento (simulação para desenvolvimento)
   */
  async criarAgendamento(usuario, dadosAgendamento) {
    // Simula a criação de um agendamento fake
    console.log('⚠️ [DEV MODE] Simulando criação de agendamento:', dadosAgendamento);
    return {
      id: 'fake-' + Date.now(),
      ...dadosAgendamento,
      usuarioId: usuario.id,
      criadoEm: new Date().toISOString(),
      mensagem: '[DEV MODE] Agendamento simulado com sucesso.'
    };
  }

  /**
   * Atualizar agendamento (temporariamente desabilitado)
   */
  async atualizarAgendamento(usuario, googleEventId, dadosAtualizacao) {
    throw new Error('Google Calendar não configurado. Configure as credenciais primeiro.');
  }

  /**
   * Excluir agendamento (temporariamente desabilitado)
   */
  async excluirAgendamento(usuario, googleEventId) {
    throw new Error('Google Calendar não configurado. Configure as credenciais primeiro.');
  }

  /**
   * Buscar agendamento específico (temporariamente desabilitado)
   */
  async buscarAgendamento(usuario, googleEventId) {
    throw new Error('Google Calendar não configurado. Configure as credenciais primeiro.');
  }

  /**
   * Invalidar cache do usuário
   */
  invalidarCacheUsuario(usuarioId) {
    console.log(`🔄 Cache invalidado para usuário ${usuarioId} (modo temporário)`);
  }

  /**
   * Obter estatísticas dos agendamentos do usuário
   */
  async obterEstatisticas(usuario) {
    return {
      total: 0,
      proximaSeamana: 0,
      hoje: 0,
      porTipo: {}
    };
  }
}

module.exports = new AgendamentoTemporarioService();
