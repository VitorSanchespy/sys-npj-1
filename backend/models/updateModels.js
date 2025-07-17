
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

class Atualizacao extends Model {
  static async criar({ usuario_id, processo_id, descricao, tipo = null, anexo = null }) {
    const atualizacao = await Atualizacao.create({ usuario_id, processo_id, descricao, tipo, anexo });
    return atualizacao.id;
  }

  static async listarPorProcesso(processoId) {
    return await Atualizacao.findAll({
      where: { processo_id: processoId },
      order: [['data_atualizacao', 'DESC']]
    });
  }

  static async remover({ processo_id, atualizacao_id }) {
    return await Atualizacao.destroy({ where: { id: atualizacao_id, processo_id } });
  }
}

Atualizacao.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  processo_id: { type: DataTypes.INTEGER, allowNull: false },
  descricao: { type: DataTypes.STRING },
  tipo: { type: DataTypes.STRING },
  anexo: { type: DataTypes.STRING },
  data_atualizacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { sequelize, modelName: 'atualizacoes', timestamps: false });

module.exports = Atualizacao;