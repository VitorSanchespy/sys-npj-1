const { DataTypes, Model } = require('sequelize');
const sequelize = require('../utils/sequelize');

class Agendamento extends Model {
  static associate(models) {
    // Associações básicas
    Agendamento.belongsTo(models.processoModel, {
      foreignKey: 'processo_id',
      as: 'processo'
    });
    
    // Usuario destinatário (para quem é o agendamento)
    Agendamento.belongsTo(models.usuarioModel, {
      foreignKey: 'usuario_id',
      as: 'destinatario'
    });
    
    // Usuario criador (quem criou o agendamento)
    Agendamento.belongsTo(models.usuarioModel, {
      foreignKey: 'criado_por',
      as: 'criador'
    });
  }
}

Agendamento.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  processo_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  criado_por: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tipo_evento: {
    type: DataTypes.ENUM('audiencia', 'prazo', 'reuniao', 'diligencia', 'outro'),
    allowNull: false
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  data_evento: {
    type: DataTypes.DATE,
    allowNull: false
  },
  local: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('agendado', 'realizado', 'cancelado', 'adiado'),
    allowNull: true,
    defaultValue: 'agendado'
  },
  lembrete_1_dia: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  },
  lembrete_2_dias: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  },
  lembrete_1_semana: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  googleEventId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID do evento no Google Calendar'
  }
}, {
  sequelize,
  modelName: 'Agendamento',
  tableName: 'agendamentos',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em'
});

module.exports = Agendamento;
