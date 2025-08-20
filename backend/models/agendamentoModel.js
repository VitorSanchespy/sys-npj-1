
const { DataTypes, Model, Sequelize } = require('sequelize');
const sequelize = require('../utils/sequelize');

class Agendamento extends Model {
  static associate(models) {
    Agendamento.belongsTo(models.processoModel, {
      foreignKey: 'processo_id',
      as: 'processo'
    });
    Agendamento.belongsTo(models.usuarioModel, {
      foreignKey: 'criado_por',
      as: 'usuario'
    });
  }

  marcarComoEnviandoConvites() {
    this.status = 'enviando_convites';
    return this.save();
  }
  marcarComoMarcado() {
    this.status = 'marcado';
    return this.save();
  }
  marcarComoFinalizado() {
    this.status = 'finalizado';
    return this.save();
  }
  cancelar() {
    this.status = 'cancelado';
    return this.save();
  }
  marcarLembreteEnviado() {
    this.lembrete_enviado = true;
    return this.save();
  }

  static findByUsuario(usuarioId) {
    return Agendamento.findAll({
      where: {
        [Sequelize.Op.or]: [
          { criado_por: usuarioId },
          Sequelize.literal(`JSON_CONTAINS(convidados, '{"email": "${usuarioId}"}')`)
        ]
      },
      order: [['data_inicio', 'ASC']],
      include: [
        { model: sequelize.models.processoModel, as: 'processo', attributes: ['id', 'numero_processo', 'titulo'] },
        { model: sequelize.models.usuarioModel, as: 'usuario', attributes: ['id', 'nome', 'email'] }
      ]
    });
  }

  static findByUsuarioEmail(email) {
    return Agendamento.findAll({
      where: {
        [Sequelize.Op.or]: [
          Sequelize.literal(`JSON_CONTAINS(convidados, JSON_OBJECT('email', '${email}'))`),
          { '$usuario.email$': email }
        ]
      },
      order: [['data_inicio', 'ASC']],
      include: [
        { model: sequelize.models.processoModel, as: 'processo', attributes: ['id', 'numero_processo', 'titulo'] },
        { model: sequelize.models.usuarioModel, as: 'usuario', attributes: ['id', 'nome', 'email'] }
      ]
    });
  }

  static findByProcesso(processoId) {
    return Agendamento.findAll({
      where: { processo_id: processoId },
      order: [['data_inicio', 'ASC']],
      include: [
        { 
          model: sequelize.models.usuarioModel, 
          as: 'usuario', 
          attributes: ['id', 'nome', 'email'],
          required: false
        }
      ]
    });
  }

  static findByPeriodo(dataInicio, dataFim, usuarioId = null) {
    const where = {
      data_inicio: {
        [Sequelize.Op.between]: [dataInicio, dataFim]
      }
    };
    if (usuarioId) {
      where.criado_por = usuarioId;
    }
    return Agendamento.findAll({
      where,
      order: [['data_inicio', 'ASC']],
      include: [
        { 
          model: sequelize.models.processoModel, 
          as: 'processo', 
          attributes: ['id', 'numero_processo', 'titulo'],
          required: false
        },
        { 
          model: sequelize.models.usuarioModel, 
          as: 'usuario', 
          attributes: ['id', 'nome', 'email'],
          required: false
        }
      ]
    });
  }

  static findPendentesLembrete() {
    const agora = new Date();
    const em24h = new Date();
    em24h.setHours(em24h.getHours() + 24);
    
    const Processo = require('./processoModel');
    const Usuario = require('./usuarioModel');
    return Agendamento.findAll({
      where: {
        data_inicio: {
          [Sequelize.Op.between]: [agora, em24h]
        },
        lembrete_enviado: false,
        [Sequelize.Op.or]: [
          { email_lembrete: { [Sequelize.Op.not]: null } },
          Sequelize.literal('JSON_LENGTH(convidados) > 0')
        ],
        status: {
          [Sequelize.Op.in]: ['enviando_convites', 'marcado']
        }
      },
      include: [
        { 
          model: Processo, 
          as: 'processo', 
          attributes: ['id', 'numero_processo', 'titulo'],
          required: false
        },
        { 
          model: Usuario, 
          as: 'usuario', 
          attributes: ['id', 'nome', 'email'],
          required: false
        }
      ]
    });
  }

  adicionarConvidado(email, nome = null) {
    const convidados = this.convidados || [];
    const jaConvidado = convidados.find(c => c.email === email);
    
    if (!jaConvidado) {
      convidados.push({
        email: email,
        nome: nome,
        status: 'pendente',
        convidado_em: new Date()
      });
      this.convidados = convidados;
    }
    return this;
  }

  async aceitarConvite(email) {
    let convidados = this.convidados;
    if (!Array.isArray(convidados)) {
      try {
        convidados = JSON.parse(convidados);
      } catch {
        convidados = [];
      }
    }
    const convidado = convidados.find(c => c.email === email);
    if (convidado) {
      convidado.status = 'aceito';
      convidado.respondido_em = new Date();
      this.convidados = convidados;
      
      // Se o agendamento está em "enviando_convites" e pelo menos um convidado aceitou,
      // marcar como "marcado"
      if (this.status === 'enviando_convites') {
        this.status = 'marcado';
        console.log(`✅ Agendamento ${this.id} marcado automaticamente após aceite de convite`);
      }
      
      await this.save();
    }
    return this;
  }

  async recusarConvite(email) {
    let convidados = this.convidados;
    if (!Array.isArray(convidados)) {
      try {
        convidados = JSON.parse(convidados);
      } catch {
        convidados = [];
      }
    }
    const convidado = convidados.find(c => c.email === email);
    if (convidado) {
      convidado.status = 'recusado';
      convidado.respondido_em = new Date();
      this.convidados = convidados;
      await this.save();
    }
    return this;
  }
}

Agendamento.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  processo_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isInt: {
        msg: 'ID do processo deve ser um número inteiro'
      }
    }
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Título é obrigatório'
      },
      len: {
        args: [3, 255],
        msg: 'Título deve ter entre 3 e 255 caracteres'
      }
    }
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  data_inicio: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: {
        msg: 'Data de início deve ser uma data válida'
      }
    }
  },
  data_fim: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: {
        msg: 'Data de fim deve ser uma data válida'
      },
      isAfterStart(value) {
        if (value < this.data_inicio) {
          throw new Error('Data de fim deve ser posterior à data de início');
        }
      }
    }
  },
  local: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  tipo: {
    type: DataTypes.ENUM('reuniao', 'audiencia', 'prazo', 'outro'),
    allowNull: false,
    defaultValue: 'reuniao',
    validate: {
      isIn: {
        args: [['reuniao', 'audiencia', 'prazo', 'outro']],
        msg: 'Tipo deve ser: reuniao, audiencia, prazo ou outro'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('em_analise', 'enviando_convites', 'marcado', 'cancelado', 'finalizado'),
    allowNull: false,
    defaultValue: 'em_analise',
    validate: {
      isIn: {
        args: [['em_analise', 'enviando_convites', 'marcado', 'cancelado', 'finalizado']],
        msg: 'Status deve ser: em_analise, enviando_convites, marcado, cancelado ou finalizado'
      }
    }
  },
  email_lembrete: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: {
        msg: 'Email deve ter formato válido'
      }
    }
  },
  convidados: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array de objetos com {email, status: pendente|aceito|recusado, nome?}'
  },
  lembrete_enviado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  lembrete_1h_enviado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Lembrete 1 hora antes foi enviado'
  },
  criado_por: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Usuário criador é obrigatório'
      }
    }
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  motivo_recusa: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Motivo da recusa quando o responsável rejeita o agendamento'
  },
  aprovado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    },
    comment: 'Usuário que aprovou o agendamento'
  },
  data_aprovacao: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data em que o agendamento foi aprovado'
  }
}, {
  sequelize,
  modelName: 'Agendamento',
  tableName: 'agendamentos',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    { fields: ['processo_id'] },
    { fields: ['data_inicio', 'data_fim'] },
    { fields: ['status'] },
    { fields: ['criado_por'] }
  ]
});

module.exports = Agendamento;
