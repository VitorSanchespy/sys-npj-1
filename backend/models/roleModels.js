const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

class Role extends Model {}

Role.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING, allowNull: false }
}, { sequelize, modelName: 'roles', timestamps: false });

module.exports = Role;
