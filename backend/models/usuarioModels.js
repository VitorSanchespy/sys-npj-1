const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');
const Role = require('./roleModels');

class Usuario extends Model {}

Usuario.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  senha: { type: DataTypes.STRING, allowNull: false },
  role_id: { type: DataTypes.INTEGER, allowNull: false },
  criado_em: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
  telefone: { type: DataTypes.STRING },
}, { sequelize, modelName: 'usuarios', timestamps: false });

Usuario.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasMany(Usuario, { foreignKey: 'role_id' });

module.exports = Usuario;
