const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

class Processo extends Model {
  static associate(models) {
    Processo.hasMany(models.atualizacoesProcessoModels, { foreignKey: 'processo_id', as: 'atualizacoes' });
    Processo.hasMany(models.arquivoModels, { foreignKey: 'processo_id', as: 'arquivos' });
    Processo.hasMany(models.usuariosProcessoModels, { foreignKey: 'processo_id', as: 'usuariosProcesso' });
    // Associações belongsTo para includes
    Processo.belongsTo(models.materiaAssuntoModels, { foreignKey: 'materia_assunto_id', as: 'materiaAssunto' });
    Processo.belongsTo(models.faseModels, { foreignKey: 'fase_id', as: 'fase' });
    Processo.belongsTo(models.diligenciaModels, { foreignKey: 'diligencia_id', as: 'diligencia' });
    Processo.belongsTo(models.localTramitacaoModels, { foreignKey: 'local_tramitacao_id', as: 'localTramitacao' });
  }
}

Processo.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    numero_processo: { type: DataTypes.STRING, allowNull: false },
    descricao: { type: DataTypes.TEXT },
    criado_em: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.STRING },
    tipo_processo: { type: DataTypes.STRING },
    idusuario_responsavel: { type: DataTypes.INTEGER },
    data_encerramento: { type: DataTypes.DATE },
    observacoes: { type: DataTypes.TEXT },
    sistema: { type: DataTypes.ENUM('Físico','PEA','PJE'), defaultValue: 'Físico' },
    materia_assunto_id: { type: DataTypes.INTEGER },
    fase_id: { type: DataTypes.INTEGER },
    diligencia_id: { type: DataTypes.INTEGER },
    num_processo_sei: { type: DataTypes.STRING },
    assistido: { type: DataTypes.STRING },
    contato_assistido: { type: DataTypes.STRING },
    local_tramitacao_id: { type: DataTypes.INTEGER }
  },
  {
    sequelize,
    modelName: 'Processo',
    tableName: 'processos',
    timestamps: false
  }
);

module.exports = Processo;