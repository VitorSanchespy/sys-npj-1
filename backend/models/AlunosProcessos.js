const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

class AlunosProcessos extends Model {}

AlunosProcessos.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  processo_id: { type: DataTypes.INTEGER, allowNull: false },
  data_atribuicao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  sequelize,
  modelName: 'alunos_processos',
  tableName: 'alunos_processos',
  timestamps: false
});

module.exports = AlunosProcessos;
