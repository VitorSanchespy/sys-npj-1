const { DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

const AgendamentoProcesso = sequelize.define('AgendamentoProcesso', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  processo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Processos',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  google_event_id: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'ID do evento no Google Calendar'
  },
  start: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Data e hora de início do agendamento'
  },
  end: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Data e hora de término do agendamento'
  },
  summary: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Título/resumo do agendamento'
  },
  tipo_evento: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Reunião',
    comment: 'Tipo do evento (Reunião, Audiência, etc.)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descrição detalhada do agendamento'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Local do agendamento'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID do usuário que criou o agendamento'
  },
  status: {
    type: DataTypes.ENUM('pendente', 'sincronizado', 'cancelado'),
    allowNull: false,
    defaultValue: 'pendente',
    comment: 'Status de sincronização com Google Calendar'
  }
}, {
  tableName: 'AgendamentosProcesso',
  timestamps: true,
  indexes: [
    {
      fields: ['processo_id']
    },
    {
      fields: ['google_event_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['start', 'end']
    }
  ]
});

// Definir associações
AgendamentoProcesso.associate = (models) => {
  // Um agendamento pertence a um processo
  // Temporariamente desabilitado para testes
  // AgendamentoProcesso.belongsTo(models.processoModel, {
  //   foreignKey: 'processo_id',
  //   as: 'processo',
  //   onDelete: 'CASCADE'
  // });
};

module.exports = AgendamentoProcesso;
