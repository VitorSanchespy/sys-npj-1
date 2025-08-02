/**
 * Migration Unificada - NPJ Database
 * Atualiza banco existente para estrutura completa
 * Data: 29/01/2025
 */

const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🚀 Iniciando migration unificada NPJ...\n');

    // 1. Verificar e criar tabela agendamentos
    try {
      await queryInterface.describeTable('agendamentos');
      console.log('✅ Tabela agendamentos já existe');
    } catch (error) {
      console.log('🔧 Criando tabela agendamentos...');
      await queryInterface.createTable('agendamentos', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        processo_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: 'processos', key: 'id' },
          onDelete: 'SET NULL'
        },
        usuario_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'usuarios', key: 'id' },
          onDelete: 'CASCADE'
        },
        criado_por: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'usuarios', key: 'id' },
          onDelete: 'CASCADE'
        },
        tipo_evento: {
          type: DataTypes.ENUM('audiencia', 'prazo', 'reuniao', 'diligencia', 'outro'),
          allowNull: false
        },
        titulo: {
          type: DataTypes.STRING(200),
          allowNull: false
        },
        descricao: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        data_evento: {
          type: DataTypes.DATE,
          allowNull: false
        },
        local: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        status: {
          type: DataTypes.ENUM('agendado', 'realizado', 'cancelado', 'adiado'),
          defaultValue: 'agendado'
        },
        lembrete_1_dia: {
          type: DataTypes.BOOLEAN,
          defaultValue: true
        },
        lembrete_2_dias: {
          type: DataTypes.BOOLEAN,
          defaultValue: true
        },
        lembrete_1_semana: {
          type: DataTypes.BOOLEAN,
          defaultValue: false
        },
        criado_em: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        },
        atualizado_em: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      });
      console.log('✅ Tabela agendamentos criada');
    }

    // 2. Verificar e criar tabela notificacoes
    try {
      await queryInterface.describeTable('notificacoes');
      console.log('✅ Tabela notificacoes já existe');
    } catch (error) {
      console.log('🔧 Criando tabela notificacoes...');
      await queryInterface.createTable('notificacoes', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        usuario_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'usuarios', key: 'id' },
          onDelete: 'CASCADE'
        },
        processo_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: 'processos', key: 'id' },
          onDelete: 'SET NULL'
        },
        agendamento_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: 'agendamentos', key: 'id' },
          onDelete: 'SET NULL'
        },
        tipo: {
          type: DataTypes.ENUM('lembrete', 'alerta', 'informacao', 'sistema'),
          allowNull: false
        },
        titulo: {
          type: DataTypes.STRING(200),
          allowNull: false
        },
        mensagem: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        canal: {
          type: DataTypes.ENUM('email', 'sistema', 'ambos'),
          defaultValue: 'sistema'
        },
        status: {
          type: DataTypes.ENUM('pendente', 'enviado', 'lido', 'erro'),
          defaultValue: 'pendente'
        },
        data_envio: {
          type: DataTypes.DATE,
          allowNull: true
        },
        data_leitura: {
          type: DataTypes.DATE,
          allowNull: true
        },
        tentativas: {
          type: DataTypes.INTEGER,
          defaultValue: 0
        },
        erro_detalhes: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        criado_em: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        },
        data_criacao: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      });
      console.log('✅ Tabela notificacoes criada');
    }

    // 3. Verificar e criar tabela configuracoes_notificacao
    try {
      await queryInterface.describeTable('configuracoes_notificacao');
      console.log('✅ Tabela configuracoes_notificacao já existe');
    } catch (error) {
      console.log('🔧 Criando tabela configuracoes_notificacao...');
      await queryInterface.createTable('configuracoes_notificacao', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        usuario_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: true,
          references: { model: 'usuarios', key: 'id' },
          onDelete: 'CASCADE'
        },
        email_agendamentos: {
          type: DataTypes.BOOLEAN,
          defaultValue: true
        },
        email_processos: {
          type: DataTypes.BOOLEAN,
          defaultValue: true
        },
        email_sistema: {
          type: DataTypes.BOOLEAN,
          defaultValue: true
        },
        sistema_agendamentos: {
          type: DataTypes.BOOLEAN,
          defaultValue: true
        },
        sistema_processos: {
          type: DataTypes.BOOLEAN,
          defaultValue: true
        },
        sistema_sistema: {
          type: DataTypes.BOOLEAN,
          defaultValue: true
        },
        email_atualizacoes: {
          type: DataTypes.BOOLEAN,
          defaultValue: true
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      });
      console.log('✅ Tabela configuracoes_notificacao criada');
    }

    // 4. Verificar e criar tabela refresh_tokens
    try {
      await queryInterface.describeTable('refresh_tokens');
      console.log('✅ Tabela refresh_tokens já existe');
    } catch (error) {
      console.log('🔧 Criando tabela refresh_tokens...');
      await queryInterface.createTable('refresh_tokens', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'usuarios', key: 'id' },
          onDelete: 'CASCADE'
        },
        token: {
          type: DataTypes.STRING(256),
          allowNull: false,
          unique: true
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false
        },
        revoked: {
          type: DataTypes.BOOLEAN,
          defaultValue: false
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      });
      console.log('✅ Tabela refresh_tokens criada');
    }

    // 5. Adicionar colunas faltantes em tabelas existentes
    
    // Arquivos - adicionar nome_original e ativo se não existirem
    try {
      const arquivosDesc = await queryInterface.describeTable('arquivos');
      
      if (!arquivosDesc.nome_original) {
        await queryInterface.addColumn('arquivos', 'nome_original', {
          type: DataTypes.STRING(255),
          allowNull: false,
          defaultValue: 'arquivo.pdf'
        });
        console.log('✅ Coluna nome_original adicionada em arquivos');
      }
      
      if (!arquivosDesc.ativo) {
        await queryInterface.addColumn('arquivos', 'ativo', {
          type: DataTypes.BOOLEAN,
          defaultValue: true
        });
        console.log('✅ Coluna ativo adicionada em arquivos');
      }

      if (!arquivosDesc.createdAt) {
        await queryInterface.addColumn('arquivos', 'createdAt', {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        });
        console.log('✅ Coluna createdAt adicionada em arquivos');
      }

      if (!arquivosDesc.updatedAt) {
        await queryInterface.addColumn('arquivos', 'updatedAt', {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        });
        console.log('✅ Coluna updatedAt adicionada em arquivos');
      }
    } catch (error) {
      console.log('⚠️ Erro ao atualizar tabela arquivos:', error.message);
    }

    // Atualizacoes_processo - adicionar campos se não existirem
    try {
      const atualizacoesDesc = await queryInterface.describeTable('atualizacoes_processo');
      
      if (!atualizacoesDesc.status) {
        await queryInterface.addColumn('atualizacoes_processo', 'status', {
          type: DataTypes.STRING(50),
          defaultValue: 'pendente'
        });
        console.log('✅ Coluna status adicionada em atualizacoes_processo');
      }
      
      if (!atualizacoesDesc.observacoes) {
        await queryInterface.addColumn('atualizacoes_processo', 'observacoes', {
          type: DataTypes.TEXT,
          allowNull: true
        });
        console.log('✅ Coluna observacoes adicionada em atualizacoes_processo');
      }

      if (!atualizacoesDesc.createdAt) {
        await queryInterface.addColumn('atualizacoes_processo', 'createdAt', {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        });
        console.log('✅ Coluna createdAt adicionada em atualizacoes_processo');
      }

      if (!atualizacoesDesc.updatedAt) {
        await queryInterface.addColumn('atualizacoes_processo', 'updatedAt', {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        });
        console.log('✅ Coluna updatedAt adicionada em atualizacoes_processo');
      }
    } catch (error) {
      console.log('⚠️ Erro ao atualizar tabela atualizacoes_processo:', error.message);
    }

    console.log('\n🎉 Migration unificada concluída com sucesso!');
    console.log('✅ Banco de dados NPJ atualizado e pronto para uso!');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔧 Revertendo migration unificada...');
    
    // Remover tabelas criadas (em ordem reversa devido às FKs)
    await queryInterface.dropTable('configuracoes_notificacao');
    await queryInterface.dropTable('refresh_tokens');
    await queryInterface.dropTable('notificacoes');
    await queryInterface.dropTable('agendamentos');
    
    // Remover colunas adicionadas
    await queryInterface.removeColumn('arquivos', 'nome_original');
    await queryInterface.removeColumn('arquivos', 'ativo');
    await queryInterface.removeColumn('atualizacoes_processo', 'status');
    await queryInterface.removeColumn('atualizacoes_processo', 'observacoes');
    
    console.log('✅ Migration revertida');
  }
};
