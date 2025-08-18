const { DataTypes, Model } = require('sequelize');
const sequelize = require('../utils/sequelize');

class EventParticipant extends Model {
  static associate(models) {
    // Relacionamento com evento
    EventParticipant.belongsTo(models.eventModel, {
      foreignKey: 'event_id',
      as: 'event'
    });

    // Relacionamento com usuário (opcional)
    EventParticipant.belongsTo(models.usuarioModel, {
      foreignKey: 'user_id',
      as: 'user'
    });
  }
}

EventParticipant.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'events',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
    }
  }
}, {
  sequelize,
  modelName: 'EventParticipant',
  tableName: 'event_participants',
  timestamps: true,
  underscored: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = EventParticipant;
