/**
 * Sistema de Migração de Banco de Dados
 * Executa migrations automaticamente
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

class MigrationRunner {
  constructor() {
    this.connection = null;
    this.migrationsPath = path.join(__dirname, '../migrations');
  }

  async connect() {
    this.connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'sistema-npj-db-1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '12345678@',
      database: process.env.DB_NAME || 'npjdatabase'
    });
  }

  async createMigrationsTable() {
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_migration_name (migration_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  async getExecutedMigrations() {
    const [rows] = await this.connection.execute(
      'SELECT migration_name FROM migrations ORDER BY migration_name'
    );
    return rows.map(row => row.migration_name);
  }

  async getMigrationFiles() {
    try {
      const files = await fs.readdir(this.migrationsPath);
      return files
        .filter(file => file.endsWith('.js'))
        .sort();
    } catch (error) {
      console.log('📁 Pasta migrations não encontrada, criando...');
      return [];
    }
  }

  async runMigration(migrationFile) {
    const migrationPath = path.join(this.migrationsPath, migrationFile);
    const migration = require(migrationPath);
    
    console.log(`🚀 Executando migration: ${migrationFile}`);
    
    try {
      await migration.up(this.connection);
      
      // Registrar migration como executada
      await this.connection.execute(
        'INSERT INTO migrations (migration_name) VALUES (?)',
        [migrationFile]
      );
      
      console.log(`✅ Migration ${migrationFile} executada com sucesso`);
    } catch (error) {
      console.error(`❌ Erro ao executar migration ${migrationFile}:`, error.message);
      throw error;
    }
  }

  async runMigrations() {
    try {
      console.log('🔄 Iniciando sistema de migrations...');
      
      await this.connect();
      await this.createMigrationsTable();
      
      const executedMigrations = await this.getExecutedMigrations();
      const migrationFiles = await this.getMigrationFiles();
      
      const pendingMigrations = migrationFiles.filter(
        file => !executedMigrations.includes(file)
      );
      
      if (pendingMigrations.length === 0) {
        console.log('✅ Nenhuma migration pendente');
        return;
      }
      
      console.log(`📋 ${pendingMigrations.length} migration(s) pendente(s)`);
      
      for (const migration of pendingMigrations) {
        await this.runMigration(migration);
      }
      
      console.log('🎉 Todas as migrations foram executadas com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro no sistema de migrations:', error);
      throw error;
    } finally {
      if (this.connection) {
        await this.connection.end();
      }
    }
  }

  async rollback(migrationName) {
    try {
      await this.connect();
      
      const migrationPath = path.join(this.migrationsPath, migrationName);
      const migration = require(migrationPath);
      
      console.log(`🔄 Fazendo rollback da migration: ${migrationName}`);
      
      await migration.down(this.connection);
      
      // Remover da tabela de migrations
      await this.connection.execute(
        'DELETE FROM migrations WHERE migration_name = ?',
        [migrationName]
      );
      
      console.log(`✅ Rollback da migration ${migrationName} executado com sucesso`);
      
    } catch (error) {
      console.error(`❌ Erro no rollback da migration ${migrationName}:`, error);
      throw error;
    } finally {
      if (this.connection) {
        await this.connection.end();
      }
    }
  }

  async checkMissingTables() {
    try {
      await this.connect();
      
      console.log('🔍 Verificando tabelas faltantes...');
      
      const requiredTables = [
        'usuarios', 'roles', 'processos', 'arquivos', 
        'agendamentos', 'notificacoes', 'configuracoes_notificacao',
        'refresh_tokens', 'atualizacoes_processo', 'usuarios_processo',
        'materia_assunto', 'fase', 'diligencia', 'local_tramitacao'
      ];
      
      const [rows] = await this.connection.execute(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE()
      `);
      
      const existingTables = rows.map(row => row.TABLE_NAME);
      const missingTables = requiredTables.filter(
        table => !existingTables.includes(table)
      );
      
      if (missingTables.length > 0) {
        console.log(`⚠️  Tabelas faltantes encontradas: ${missingTables.join(', ')}`);
        console.log('💡 Execute as migrations para criar as tabelas faltantes');
        return missingTables;
      } else {
        console.log('✅ Todas as tabelas necessárias estão presentes');
        return [];
      }
      
    } catch (error) {
      console.error('❌ Erro ao verificar tabelas:', error);
      throw error;
    } finally {
      if (this.connection) {
        await this.connection.end();
      }
    }
  }
}

module.exports = MigrationRunner;
