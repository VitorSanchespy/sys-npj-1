const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

class AtualizacoesProcesso extends Model {
  static associate(models) {
    // Relationship with usuarios
    AtualizacoesProcesso.belongsTo(models.Usuario, {
      foreignKey: 'usuario_id',
      as: 'usuario',
      onDelete: 'CASCADE'
    });

    // Relationship with processos
    AtualizacoesProcesso.belongsTo(models.Processo, {
      foreignKey: 'processo_id',
      as: 'processo',
      onDelete: 'CASCADE'
    });

    // Relationship with arquivos
    AtualizacoesProcesso.belongsTo(models.Arquivo, {
      foreignKey: 'arquivos_id',
      as: 'arquivo',
      onDelete: 'SET NULL'
    });
  }
}

AtualizacoesProcesso.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    processo_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    arquivos_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tipo_atualizacao: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['informacao', 'arquivo']]
      }
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    data_atualizacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'AtualizacoesProcesso',
    tableName: 'atualizacoes_processo',
    timestamps: true
  }
);

module.exports = AtualizacoesProcesso;
