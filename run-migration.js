#!/usr/bin/env node

/**
 * Script para executar migration unificada NPJ
 * Atualiza o banco para a estrutura completa
 */

const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

console.log('🚀 NPJ Migration Runner\n');

// Verificar se o Sequelize CLI está disponível
function checkSequelizeCLI() {
  return new Promise((resolve) => {
    exec('npx sequelize-cli --version', (error) => {
      resolve(!error);
    });
  });
}

// Executar migration
function runMigration() {
  return new Promise((resolve, reject) => {
    console.log('⚡ Executando migration unificada...\n');
    
    const migrationCmd = 'npx sequelize-cli db:migrate --migrations-path=./backend/migrations';
    
    exec(migrationCmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      
      console.log(stdout);
      if (stderr) console.log(stderr);
      resolve();
    });
  });
}

// Verificar status das migrations
function checkMigrationStatus() {
  return new Promise((resolve, reject) => {
    console.log('📋 Verificando status das migrations...\n');
    
    const statusCmd = 'npx sequelize-cli db:migrate:status --migrations-path=./backend/migrations';
    
    exec(statusCmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      
      console.log(stdout);
      if (stderr) console.log(stderr);
      resolve();
    });
  });
}

// Função principal
async function main() {
  try {
    // Verificar Sequelize CLI
    const hasSequelize = await checkSequelizeCLI();
    if (!hasSequelize) {
      console.log('❌ Sequelize CLI não encontrado');
      console.log('💡 Instale com: npm install -g sequelize-cli');
      return;
    }

    console.log('✅ Sequelize CLI encontrado\n');

    // Verificar se existe configuração do Sequelize
    const configPath = path.join(process.cwd(), 'backend', '.sequelizerc');
    if (!fs.existsSync(configPath)) {
      console.log('⚠️ Arquivo .sequelizerc não encontrado no backend');
      console.log('💡 Criando configuração padrão...\n');
      
      const sequelizeConfig = `const path = require('path');

module.exports = {
  'config': path.resolve('config', 'config.json'),
  'models-path': path.resolve('models'),
  'seeders-path': path.resolve('seeders'),
  'migrations-path': path.resolve('migrations')
};`;
      
      fs.writeFileSync(configPath, sequelizeConfig);
      console.log('✅ Configuração .sequelizerc criada\n');
    }

    // Verificar status atual
    try {
      await checkMigrationStatus();
    } catch (error) {
      console.log('⚠️ Não foi possível verificar status (banco pode não existir)\n');
    }

    // Executar migration
    await runMigration();
    
    console.log('\n🎉 Migration concluída com sucesso!');
    console.log('✅ Banco NPJ atualizado e pronto para uso!');
    
    // Verificar status final
    console.log('\n📊 Status final das migrations:');
    await checkMigrationStatus();

  } catch (error) {
    console.error('\n❌ Erro durante a migration:', error.message);
    
    if (error.message.includes('ER_BAD_DB_ERROR')) {
      console.log('\n💡 Solução: Crie o banco de dados primeiro');
      console.log('   CREATE DATABASE npjdatabase;');
    }
    
    if (error.message.includes('ER_ACCESS_DENIED_ERROR')) {
      console.log('\n💡 Solução: Verifique as credenciais do MySQL');
      console.log('   - Arquivo: backend/config/config.json');
    }
    
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main };
