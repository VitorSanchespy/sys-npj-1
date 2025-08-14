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
// const agendamentoModel = require('./agendamentoModel'); // DESABILITADO - Google Calendar
const agendamentoProcessoModel = require('./agendamentoProcessoModel'); // Agendamentos vinculados a processos
const notificacaoModel = require('./notificacaoModel');
const configuracaoNotificacaoModel = require('./configuracaoNotificacaoModel');

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
  // agendamentoModel, // DESABILITADO - Google Calendar
  agendamentoProcessoModel, // Agendamentos vinculados a processos
  notificacaoModel,
  configuracaoNotificacaoModel,
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
