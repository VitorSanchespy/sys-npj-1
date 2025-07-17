
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

class Arquivo extends Model {
  static async criar({ nome, caminho, tamanho, tipo, processo_id, usuario_id }) {
    const arquivo = await Arquivo.create({ nome, caminho, tamanho, tipo, processo_id, usuario_id });
    return arquivo.id;
  }

  static async listarPorProcesso(processoId) {
    return await Arquivo.findAll({ where: { processo_id: processoId } });
  }

  static async listarPorUsuario(usuarioId) {
    return await Arquivo.findAll({ where: { usuario_id: usuarioId } });
  }

  static async anexarAProcesso(arquivoId, processoId) {
    return await Arquivo.update({ processo_id: processoId }, { where: { id: arquivoId } });
  }
}

Arquivo.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  caminho: { type: DataTypes.STRING, allowNull: false },
  tamanho: { type: DataTypes.INTEGER },
  tipo: { type: DataTypes.STRING },
  processo_id: { type: DataTypes.INTEGER },
  usuario_id: { type: DataTypes.INTEGER },
}, { sequelize, modelName: 'arquivos', timestamps: false });

module.exports = Arquivo;