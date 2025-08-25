const sequelize = require('../utils/sequelize');

// Serviço de logging para rastrear ações importantes do sistema
class LogService {
  
  /**
   * Log de ação do usuário
   */
  static async logAcao(dados) {
    try {
      const { 
        usuario_id, 
        acao, 
        recurso, 
        recurso_id, 
        detalhes = {}, 
        ip_address = null,
        user_agent = null 
      } = dados;

      const logEntry = {
        usuario_id,
        acao,
        recurso,
        recurso_id,
        detalhes: JSON.stringify(detalhes),
        ip_address,
        user_agent,
        data_acao: new Date()
      };

      // Inserir diretamente no banco (modelo será criado depois se necessário)
      await sequelize.query(`
        INSERT INTO logs_acoes 
        (usuario_id, acao, recurso, recurso_id, detalhes, ip_address, user_agent, data_acao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, {
        replacements: Object.values(logEntry),
        type: sequelize.QueryTypes.INSERT
      });

      console.log(`📋 [LOG] ${acao} - ${recurso}:${recurso_id} por usuário ${usuario_id}`);
      
    } catch (error) {
      console.error('Erro ao salvar log:', error);
      // Não falhar a operação principal por causa do log
    }
  }

  /**
   * Log específico para convites
   */
  static async logConvite(agendamento_id, email_convidado, acao, detalhes = {}) {
    return this.logAcao({
      usuario_id: null, // Convite público
      acao: `convite_${acao}`,
      recurso: 'agendamento',
      recurso_id: agendamento_id,
      detalhes: {
        email_convidado,
        ...detalhes
      }
    });
  }

  /**
   * Log de ações do admin/professor
   */
  static async logAcaoAdmin(usuario_id, acao, agendamento_id, detalhes = {}) {
    return this.logAcao({
      usuario_id,
      acao: `admin_${acao}`,
      recurso: 'agendamento',
      recurso_id: agendamento_id,
      detalhes
    });
  }

  /**
   * Log de tentativas suspeitas
   */
  static async logTentativaSuspeita(detalhes, ip_address = null) {
    return this.logAcao({
      usuario_id: null,
      acao: 'tentativa_suspeita',
      recurso: 'sistema',
      recurso_id: null,
      detalhes,
      ip_address
    });
  }

  /**
   * Criar tabela de logs se não existir
   */
  static async criarTabelaLogs() {
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS logs_acoes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id INTEGER,
          acao VARCHAR(100) NOT NULL,
          recurso VARCHAR(50) NOT NULL,
          recurso_id INTEGER,
          detalhes TEXT,
          ip_address VARCHAR(45),
          user_agent TEXT,
          data_acao DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tabela de logs criada/verificada');
    } catch (error) {
      console.error('Erro ao criar tabela de logs:', error);
    }
  }
}

module.exports = LogService;
