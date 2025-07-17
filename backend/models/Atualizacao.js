const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

class Atualizacao extends Model {}

Atualizacao.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  processo_id: { type: DataTypes.INTEGER, allowNull: false },
  descricao: { type: DataTypes.STRING },
  criado_em: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  tipo_anexo: { type: DataTypes.STRING },
  // Adicione outros campos conforme necessário
}, { sequelize, modelName: 'atualizacoes', timestamps: false });

module.exports = Atualizacao;
