
const Sequelize = require('sequelize');
const sequelize = require('../config/sequelize');

const Usuario = require('./Usuario');
const UsuariosProcesso = require('./UsuariosProcesso');
const Processo = require('./Processo');
const Arquivo = require('./arquivoModels');
const MateriaAssunto = require('./materiaAssuntoModels');
const Fase = require('./faseModels');
const Diligencia = require('./diligenciaModels');
const LocalTramitacao = require('./localTramitacaoModels');
const Role = require('./roleModels');
const AtualizacoesProcesso = require('./atualizacaoProcessoModels');

// Adicione as associações entre os modelos aqui, se necessário
// Exemplo:
// Usuario.hasMany(Processo, { foreignKey: 'usuario_id' });
// Processo.belongsTo(Usuario, { foreignKey: 'usuario_id' });

module.exports = {
  Usuario,
  UsuariosProcesso,
  Processo,
  Arquivo,
  MateriaAssunto,
  Fase,
  Diligencia,
  LocalTramitacao,
  Role,
  AtualizacoesProcesso,
  sequelize,
  Sequelize
};
