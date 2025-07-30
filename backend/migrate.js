#!/usr/bin/env node

/**
 * Script CLI para gerenciar migrations
 * Uso: node migrate.js [comando]
 * 
 * Comandos:
 *   up      - Executa migrations pendentes
 *   check   - Verifica tabelas faltantes
 *   rollback <nome> - Desfaz uma migration específica
 */

require('dotenv').config();
const MigrationRunner = require('./utils/migrationRunner');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'up';
  
  const runner = new MigrationRunner();
  
  try {
    switch (command) {
      case 'up':
        await runner.runMigrations();
        break;
        
      case 'check':
        await runner.checkMissingTables();
        break;
        
      case 'rollback':
        const migrationName = args[1];
        if (!migrationName) {
          console.error('❌ Nome da migration é obrigatório para rollback');
          console.log('💡 Uso: node migrate.js rollback <nome_da_migration>');
          process.exit(1);
        }
        await runner.rollback(migrationName);
        break;
        
      default:
        console.log('📚 Comandos disponíveis:');
        console.log('  up      - Executa migrations pendentes');
        console.log('  check   - Verifica tabelas faltantes');
        console.log('  rollback <nome> - Desfaz uma migration específica');
        break;
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { MigrationRunner };
