const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

class LocalTramitacao extends Model {}

LocalTramitacao.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  },
  {
    sequelize,
    modelName: 'LocalTramitacao',
    tableName: 'local_tramitacao',
    timestamps: false
  }
);

module.exports = LocalTramitacao;
