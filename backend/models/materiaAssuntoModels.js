const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

class MateriaAssunto extends Model {}

MateriaAssunto.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING, allowNull: false, unique: true }
}, { sequelize, modelName: 'materia_assunto', tableName: 'materia_assunto', timestamps: false });

module.exports = MateriaAssunto;
