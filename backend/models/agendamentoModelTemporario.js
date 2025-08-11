/**
 * Modelo temporário para agendamentos (DESABILITADO)
 * A tabela agendamentos foi removida - usando Google Calendar
 */

// Classe mock para evitar erros de importação
class AgendamentoTemporario {
  static associate(models) {
    // Associações desabilitadas - tabela não existe mais
    console.log('⚠️ AgendamentoModel desabilitado - usando Google Calendar');
  }

  static async findAll() {
    return [];
  }

  static async findByPk() {
    return null;
  }

  static async create() {
    throw new Error('Agendamentos agora são gerenciados via Google Calendar');
  }

  static async count() {
    return 0;
  }
}

module.exports = AgendamentoTemporario;
