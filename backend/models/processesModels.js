

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

class Processo extends Model {
  static async listarAlunosPorProcesso(processoId) {
    const AlunosProcessos = require('./AlunosProcessos');
    const Usuario = require('./Usuario');
    const relacoes = await AlunosProcessos.findAll({ where: { processo_id: processoId } });
    const ids = relacoes.map(r => r.usuario_id);
    if (!ids.length) return [];
    return await Usuario.findAll({ where: { id: ids } });
  }
  static async buscarPorId(id) {
    return await Processo.findByPk(id);
  }
  static async listarPorAluno(usuarioId) {
    // Supondo que existe um relacionamento AlunoProcesso
    const AlunosProcessos = require('./AlunosProcessos');
    const relacoes = await AlunosProcessos.findAll({ where: { usuario_id: usuarioId } });
    const ids = relacoes.map(r => r.processo_id);
    if (!ids.length) return [];
    return await Processo.findAll({ where: { id: ids } });
  }
  static async listarTodos() {
    return await Processo.findAll();
  }
  static async criar({ numero_processo, descricao, status, materia_assunto_id, local_tramitacao, sistema, fase_id, diligencia_id, idusuario_responsavel, data_encerramento, observacoes, num_processo_sei, assistido }) {
    const processo = await Processo.create({
      numero_processo,
      descricao,
      status,
      materia_assunto_id,
      local_tramitacao,
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
  static async atribuirAluno(processoId, usuarioId) {
    const AlunosProcessos = require('./AlunosProcessos');
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
}

Processo.init({
  id: { type: require('sequelize').DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  numero_processo: { type: require('sequelize').DataTypes.STRING },
  descricao: { type: require('sequelize').DataTypes.STRING },
  status: { type: require('sequelize').DataTypes.STRING },
  materia_assunto_id: { type: require('sequelize').DataTypes.INTEGER },
  local_tramitacao: { type: require('sequelize').DataTypes.STRING },
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