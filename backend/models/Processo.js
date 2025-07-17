const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

class Processo extends Model {}

Processo.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  numero: { type: DataTypes.STRING, allowNull: false },
  descricao: { type: DataTypes.STRING },
  criado_em: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
  // Adicione outros campos conforme necessário
}, { sequelize, modelName: 'processos', timestamps: false });

module.exports = Processo;
