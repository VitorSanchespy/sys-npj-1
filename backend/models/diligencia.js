const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

class Diligencia extends Model {}

Diligencia.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING, allowNull: false, unique: true }
}, { sequelize, modelName: 'diligencia', timestamps: false });

module.exports = Diligencia;
