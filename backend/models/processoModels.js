const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');
class Processo extends Model {
  static async buscarPorNumero(numero) {
    const resultado = await Processo.findOne({ where: { numero_processo: numero } });
    if (!resultado) {
      throw new Error('Processo não encontrado');
    }
    console.log(`[DEBUG] Processo encontrado:`, resultado);
    return resultado;
  }

  static async buscarPorId(id) {
    return await Processo.findByPk(id);
  }
  static async listarTodos() {
    console.log('Executing listarTodos query...');
    return await Processo.findAll();
  }

  static async criar({ numero_processo, descricao, status, materia_assunto_id, local_tramitacao_id, sistema, fase_id, diligencia_id, idusuario_responsavel, data_encerramento, observacoes, num_processo_sei, assistido }) {
    const processo = await Processo.create({
      numero_processo,
      descricao,
      status,
      materia_assunto_id,
      local_tramitacao_id,
      sistema,
      fase_id,
      diligencia_id,
      idusuario_responsavel,
      data_encerramento,
      observacoes,
      num_processo_sei,
      assistido
    });
    return processo.id;
  }

  // Para atribuir aluno, seria melhor criar um modelo AlunoProcesso
  static async atribuirUsuario(processoId, usuarioId) {
    const AlunosProcessos = require('./usuariosProcessoModels');
    const existe = await AlunosProcessos.findOne({ where: { usuario_id: usuarioId, processo_id: processoId } });
    if (existe) {
      const err = new Error('Aluno já está atribuído a este processo');
      err.status = 409;
      throw err;
    }
    await AlunosProcessos.create({ usuario_id: usuarioId, processo_id: processoId });
    return true;
  }

  static async listarPorResponsavel(usuarioId) {
    // Considera campo idusuario_responsavel como responsável
    return await Processo.findAll({ where: { idusuario_responsavel: usuarioId } });
  }

  static async vincularUsuario(processoId, usuarioId, role) {
    const Model = role === 'Professor' ? require('./ProfessoresProcessos') : require('./AlunosProcessos');
    await Model.create({ processo_id: processoId, usuario_id: usuarioId });
  }

  static async listarUsuariosPorProcesso(processoId, pagina = 1, porPagina = 10) {
    const Usuario = require('./usuarioModels');
    const UsuariosProcesso = require('./usuariosProcessoModels');

    const relacoes = await UsuariosProcesso.findAll({
      where: { processo_id: processoId },
      attributes: ['usuario_id'],
      offset: (pagina - 1) * porPagina,
      limit: porPagina
    });

    const usuarioIds = relacoes.map(r => r.usuario_id);

    const usuarios = await Usuario.findAll({
      where: { id: usuarioIds },
      attributes: ['id', 'nome', 'role']
    });

    return usuarios;
  }

  static async adicionarUsuarioAoProcesso(processoId, usuarioId) {
    const Usuario = require('./usuarioModels');

    // Verificar se o usuário existe e tem role_id 2 ou 3
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario || ![2, 3].includes(usuario.role_id)) {
        throw new Error('Usuário inválido ou não permitido');
    }

    // Verificar se o usuário já está vinculado ao processo
    const AlunosProcessos = require('./AlunosProcessos');
    const ProfessoresProcessos = require('./ProfessoresProcessos');

    const jaVinculado = await AlunosProcessos.findOne({ where: { processo_id: processoId, usuario_id: usuarioId } }) ||
                        await ProfessoresProcessos.findOne({ where: { processo_id: processoId, usuario_id: usuarioId } });

    if (jaVinculado) {
        throw new Error('Usuário já vinculado ao processo');
    }

    // Vincular o usuário ao processo
    const Model = usuario.role_id === 2 ? AlunosProcessos : ProfessoresProcessos;
    await Model.create({ processo_id: processoId, usuario_id: usuarioId });

    return true;
}

static associate(models) {
    Processo.belongsTo(models.LocalTramitacao, {
      foreignKey: 'local_tramitacao_id',
      as: 'localTramitacao'
    });
  }
}

Processo.init({
  id: { type: require('sequelize').DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  numero_processo: { type: require('sequelize').DataTypes.STRING },
  descricao: { type: require('sequelize').DataTypes.STRING },
  status: { type: require('sequelize').DataTypes.STRING },
  materia_assunto_id: { type: require('sequelize').DataTypes.INTEGER },
  local_tramitacao_id: { type: require('sequelize').DataTypes.INTEGER },
  sistema: { type: require('sequelize').DataTypes.STRING },
  fase_id: { type: require('sequelize').DataTypes.INTEGER },
  diligencia_id: { type: require('sequelize').DataTypes.INTEGER },
  idusuario_responsavel: { type: require('sequelize').DataTypes.INTEGER },
  data_encerramento: { type: require('sequelize').DataTypes.DATE },
  observacoes: { type: require('sequelize').DataTypes.STRING },
  num_processo_sei: { type: require('sequelize').DataTypes.STRING },
  assistido: { type: require('sequelize').DataTypes.STRING },
}, { sequelize: require('../config/sequelize'), modelName: 'processos', timestamps: false });

module.exports = Processo;