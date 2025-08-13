const { DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

const AgendamentoTeste = sequelize.define('AgendamentoTeste', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  processo_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  google_event_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  start: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end: {
    type: DataTypes.DATE,
    allowNull: false
  },
  summary: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pendente', 'sincronizado', 'cancelado'),
    allowNull: false,
    defaultValue: 'pendente'
  }
}, {
  tableName: 'AgendamentosProcesso',
  timestamps: true
});

module.exports = AgendamentoTeste;
