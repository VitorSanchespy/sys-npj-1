const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

class Fase extends Model {}

Fase.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING, allowNull: false, unique: true }
}, { sequelize, modelName: 'fase', tableName: 'fase', timestamps: false });

module.exports = Fase;
