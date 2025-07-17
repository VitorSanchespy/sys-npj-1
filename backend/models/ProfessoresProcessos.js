const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

class ProfessoresProcessos extends Model {}

ProfessoresProcessos.init(
  {
    processo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'ProfessoresProcessos',
    tableName: 'professores_processos',
    timestamps: false,
  }
);

module.exports = ProfessoresProcessos;
