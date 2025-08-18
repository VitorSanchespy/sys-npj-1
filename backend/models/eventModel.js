const { DataTypes, Model } = require('sequelize');
const sequelize = require('../utils/sequelize');

class Event extends Model {
  static associate(models) {
    // Relacionamento com usuário solicitante
    Event.belongsTo(models.usuarioModel, {
      foreignKey: 'requester_id',
      as: 'requester'
    });

    // Relacionamento com usuário aprovador
    Event.belongsTo(models.usuarioModel, {
      foreignKey: 'approver_id',
      as: 'approver'
    });

    // Relacionamento com participantes
    Event.hasMany(models.eventParticipantModel, {
      foreignKey: 'event_id',
      as: 'participants'
    });

    // Relacionamento com notificações
    Event.hasMany(models.eventNotificationModel, {
      foreignKey: 'event_id',
      as: 'notifications'
    });
  }

  // Método para verificar se o evento pode ser aprovado
  canBeApproved() {
    return this.status === 'requested';
  }

  // Método para verificar se o evento pode ser rejeitado
  canBeRejected() {
    return this.status === 'requested';
  }

  // Método para verificar se o evento deve ser marcado como completo
  shouldBeCompleted() {
    return this.status === 'approved' && new Date() > new Date(this.end_at);
  }

  // Método para verificar se é hoje
  isToday() {
    const today = new Date();
    const eventDate = new Date(this.start_at);
    return (
      today.getFullYear() === eventDate.getFullYear() &&
      today.getMonth() === eventDate.getMonth() &&
      today.getDate() === eventDate.getDate()
    );
  }

  // Método para verificar se começa em ~60 minutos
  startsInAnHour() {
    const now = new Date();
    const eventStart = new Date(this.start_at);
    const diffInMinutes = (eventStart - now) / (1000 * 60);
    return diffInMinutes >= 45 && diffInMinutes <= 75; // 45-75 min window
  }
}

Event.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  start_at: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
      isAfter: new Date().toISOString()
    }
  },
  end_at: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
      isAfterStartDate(value) {
        if (value <= this.start_at) {
          throw new Error('Data de fim deve ser posterior à data de início');
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM('requested', 'approved', 'rejected', 'canceled', 'completed'),
    allowNull: false,
    defaultValue: 'requested'
  },
  requester_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  approver_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Event',
  tableName: 'events',
  timestamps: true,
  underscored: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = Event;
