const { DataTypes, Model } = require('sequelize');
const sequelize = require('../utils/sequelize');

class EventNotification extends Model {
  static associate(models) {
    // Relacionamento com evento
    EventNotification.belongsTo(models.eventModel, {
      foreignKey: 'event_id',
      as: 'event'
    });
  }

  // Método para verificar se já foi enviada uma notificação deste tipo para este evento
  static async wasAlreadySent(eventId, type, additionalMeta = {}) {
    const notification = await EventNotification.findOne({
      where: {
        event_id: eventId,
        type: type,
        ...additionalMeta
      }
    });
    return !!notification;
  }
}

EventNotification.init({
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
  type: {
    type: DataTypes.ENUM('approval_request', 'approved', 'rejected', 'daily_reminder', 'hourly_reminder'),
    allowNull: false
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  meta: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  sequelize,
  modelName: 'EventNotification',
  tableName: 'event_notifications',
  timestamps: true,
  underscored: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = EventNotification;
