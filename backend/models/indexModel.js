const Sequelize = require('sequelize');
const sequelize = require('../utils/sequelize');

const roleModel = require('./roleModel');
const usuarioModel = require('./usuarioModel');
const diligenciaModel = require('./diligenciaModel');
const faseModel = require('./faseModel');
const materiaAssuntoModel = require('./materiaAssuntoModel');
const localTramitacaoModel = require('./localTramitacaoModel');
const processoModel = require('./processoModel');
const arquivoModel = require('./arquivoModel');
const atualizacaoProcessoModel = require('./atualizacaoProcessoModel');
const usuarioProcessoModel = require('./usuarioProcessoModel');
const agendamentoModel = require('./agendamentoModel'); // Sistema unificado de agendamentos
const notificacaoModel = require('./notificacaoModel');
const configuracaoNotificacaoModel = require('./configuracaoNotificacaoModel');
const eventModel = require('./eventModel');
const eventParticipantModel = require('./eventParticipantModel');
const eventNotificationModel = require('./eventNotificationModel');

const models = {
  roleModel,
  usuarioModel,
  diligenciaModel,
  faseModel,
  materiaAssuntoModel,
  localTramitacaoModel,
  processoModel,
  arquivoModel,
  atualizacaoProcessoModel,
  usuarioProcessoModel,
  agendamentoModel, // Sistema unificado de agendamentos
  notificacaoModel,
  configuracaoNotificacaoModel,
  eventModel,
  eventParticipantModel,
  eventNotificationModel,
  sequelize,
  Sequelize
};

// Inicializar associações
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = models;
