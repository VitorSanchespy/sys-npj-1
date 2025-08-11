const { DataTypes, Model } = require('sequelize');
const sequelize = require('../utils/sequelize');

class Notificacao extends Model {
  static associate(models) {
    Notificacao.belongsTo(models.usuarioModel, { 
      foreignKey: 'usuario_id', 
      as: 'usuario' 
    });
    Notificacao.belongsTo(models.processoModel, { 
      foreignKey: 'processo_id', 
      as: 'processo' 
    });
    // Removido: associação com agendamentoModel (agora usa Google Calendar)
    // Notificacao.belongsTo(models.agendamentoModel, { 
    //   foreignKey: 'agendamento_id', 
    //   as: 'agendamento' 
    // });
  }
}

Notificacao.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    processo_id: { type: DataTypes.INTEGER, allowNull: true },
    evento_externo_id: { type: DataTypes.STRING(255), allowNull: true, comment: 'ID do evento em sistema externo (Google Calendar, etc)' },
    tipo: { 
      type: DataTypes.ENUM('lembrete', 'alerta', 'informacao', 'sistema'), 
      allowNull: false 
    },
    titulo: { type: DataTypes.STRING(200), allowNull: false },
    mensagem: { type: DataTypes.TEXT, allowNull: false },
    canal: { 
      type: DataTypes.ENUM('email', 'sistema', 'ambos'), 
      defaultValue: 'sistema' 
    },
    status: { 
      type: DataTypes.ENUM('pendente', 'enviado', 'lido', 'erro'), 
      defaultValue: 'pendente' 
    },
    data_envio: { type: DataTypes.DATE },
    data_leitura: { type: DataTypes.DATE },
    tentativas: { type: DataTypes.INTEGER, defaultValue: 0 },
    erro_detalhes: { type: DataTypes.TEXT },
    criado_em: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  {
    sequelize,
    modelName: 'Notificacao',
    tableName: 'notificacoes',
    timestamps: false
  }
);

module.exports = Notificacao;
