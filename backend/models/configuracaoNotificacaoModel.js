const { DataTypes, Model } = require('sequelize');
const sequelize = require('../utils/sequelize');

class ConfiguracaoNotificacao extends Model {
  static associate(models) {
    ConfiguracaoNotificacao.belongsTo(models.usuarioModel, { 
      foreignKey: 'usuario_id', 
      as: 'usuario' 
    });
    models.usuarioModel.hasOne(ConfiguracaoNotificacao, {
      foreignKey: 'usuario_id',     
        as: 'configuracao'
    });
  }
}

ConfiguracaoNotificacao.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    email_agendamentos: { type: DataTypes.BOOLEAN, defaultValue: true },
    email_processos: { type: DataTypes.BOOLEAN, defaultValue: true },
    email_sistema: { type: DataTypes.BOOLEAN, defaultValue: true },
    sistema_agendamentos: { type: DataTypes.BOOLEAN, defaultValue: true },
    sistema_processos: { type: DataTypes.BOOLEAN, defaultValue: true },
    sistema_sistema: { type: DataTypes.BOOLEAN, defaultValue: true },
    email_atualizacoes: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  {
    sequelize,
    modelName: 'ConfiguracaoNotificacao',
    tableName: 'configuracoes_notificacao',
    timestamps: true
  }
);

module.exports = ConfiguracaoNotificacao;
