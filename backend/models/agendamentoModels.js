const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

class Agendamento extends Model {}

Agendamento.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  processo_id: { type: DataTypes.INTEGER, allowNull: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  tipo_evento: {
    type: DataTypes.ENUM('audiencia', 'prazo', 'reuniao', 'diligencia', 'outro'),
    allowNull: false
  },
  titulo: { type: DataTypes.STRING(200), allowNull: false },
  descricao: { type: DataTypes.TEXT, allowNull: true },
  data_evento: { type: DataTypes.DATE, allowNull: false },
  local: { type: DataTypes.STRING(255), allowNull: true },
  status: {
    type: DataTypes.ENUM('agendado', 'realizado', 'cancelado', 'adiado'),
    defaultValue: 'agendado'
  }
}, {
  sequelize,
  modelName: 'Agendamento',
  tableName: 'agendamentos',
  timestamps: false
});

module.exports = Agendamento;
