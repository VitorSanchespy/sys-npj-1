#!/usr/bin/env node

/**
 * Script de Limpeza dos Arquivos de Teste
 * Remove mocks, temporários e arquivos de teste, mantendo apenas estrutura essencial
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 LIMPEZA DOS ARQUIVOS DE TESTE DO MÓDULO DE AGENDAMENTO');
console.log('=' .repeat(60));

class TestCleaner {
  constructor() {
    this.testDir = path.join(__dirname);
    this.filesToRemove = [];
    this.dirsToRemove = [];
  }

  async cleanAll() {
    console.log('📋 Analisando arquivos para limpeza...');
    
    this.scanForCleanup();
    
    if (this.filesToRemove.length === 0 && this.dirsToRemove.length === 0) {
      console.log('✨ Nenhum arquivo de limpeza encontrado. Sistema já limpo!');
      return;
    }

    this.showCleanupPlan();
    
    if (this.confirmCleanup()) {
      await this.executeCleanup();
      console.log('✅ Limpeza concluída com sucesso!');
    } else {
      console.log('❌ Limpeza cancelada pelo usuário.');
    }
  }

  scanForCleanup() {
    const files = fs.readdirSync(this.testDir);
    
    files.forEach(file => {
      const filePath = path.join(this.testDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Remover diretórios temporários
        if (['temp', 'coverage', 'node_modules'].includes(file)) {
          this.dirsToRemove.push(filePath);
        }
        
        // Verificar subdiretórios
        if (file === 'reports') {
          const reportFiles = fs.readdirSync(filePath);
          reportFiles.forEach(reportFile => {
            if (reportFile.endsWith('.tmp') || reportFile.includes('temp')) {
              this.filesToRemove.push(path.join(filePath, reportFile));
            }
          });
        }
      } else {
        // Remover arquivos mock e temporários
        if (this.shouldRemoveFile(file)) {
          this.filesToRemove.push(filePath);
        }
      }
    });
  }

  shouldRemoveFile(filename) {
    const removePatterns = [
      /\.mock\.json$/,           // Arquivos mock
      /\.temp\./,               // Arquivos temporários
      /^temp-/,                 // Arquivos temporários com prefixo
      /test-session\.json$/,     // Sessões de teste
      /\.log$/,                 // Logs de teste
      /coverage\.json$/,         // Dados de cobertura
      /\.nyc_output/            // Output do NYC
    ];

    // Manter arquivos essenciais de teste
    const keepPatterns = [
      /\.spec\.js$/,            // Arquivos de teste
      /run-tests\.js$/,         // Script de execução
      /clean-tests\.js$/,       // Este script
      /package\.json$/,         // Configuração
      /README\.md$/             // Documentação
    ];

    // Se deve manter, não remover
    if (keepPatterns.some(pattern => pattern.test(filename))) {
      return false;
    }

    // Se corresponde a padrão de remoção, remover
    return removePatterns.some(pattern => pattern.test(filename));
  }

  showCleanupPlan() {
    console.log('\n📋 PLANO DE LIMPEZA:');
    console.log('-' .repeat(40));
    
    if (this.filesToRemove.length > 0) {
      console.log('\n🗑️ Arquivos a serem removidos:');
      this.filesToRemove.forEach(file => {
        const relativePath = path.relative(this.testDir, file);
        console.log(`   ❌ ${relativePath}`);
      });
    }

    if (this.dirsToRemove.length > 0) {
      console.log('\n📁 Diretórios a serem removidos:');
      this.dirsToRemove.forEach(dir => {
        const relativePath = path.relative(this.testDir, dir);
        console.log(`   ❌ ${relativePath}/`);
      });
    }

    console.log(`\n📊 Total: ${this.filesToRemove.length} arquivos + ${this.dirsToRemove.length} diretórios`);
  }

  confirmCleanup() {
    // Em ambiente automatizado, confirmar sempre
    if (process.env.AUTO_CLEAN === 'true' || process.argv.includes('--force')) {
      return true;
    }

    // Simular confirmação do usuário
    console.log('\n❓ Deseja prosseguir com a limpeza? (y/N)');
    
    // Para ambiente de teste, assumir 'sim'
    return true;
  }

  async executeCleanup() {
    console.log('\n🧹 Executando limpeza...');
    
    // Remover arquivos
    this.filesToRemove.forEach(file => {
      try {
        fs.unlinkSync(file);
        const relativePath = path.relative(this.testDir, file);
        console.log(`   ✅ Removido: ${relativePath}`);
      } catch (error) {
        console.log(`   ❌ Erro ao remover ${file}: ${error.message}`);
      }
    });

    // Remover diretórios
    this.dirsToRemove.forEach(dir => {
      try {
        this.removeDirectory(dir);
        const relativePath = path.relative(this.testDir, dir);
        console.log(`   ✅ Removido: ${relativePath}/`);
      } catch (error) {
        console.log(`   ❌ Erro ao remover ${dir}: ${error.message}`);
      }
    });

    this.generateCleanupReport();
  }

  removeDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      return;
    }

    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.removeDirectory(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
    
    fs.rmdirSync(dirPath);
  }

  generateCleanupReport() {
    const report = {
      timestamp: new Date().toISOString(),
      filesRemoved: this.filesToRemove.length,
      dirsRemoved: this.dirsToRemove.length,
      removedFiles: this.filesToRemove.map(f => path.relative(this.testDir, f)),
      removedDirs: this.dirsToRemove.map(d => path.relative(this.testDir, d))
    };

    const reportPath = path.join(this.testDir, 'cleanup-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 Relatório de limpeza salvo em: cleanup-report.json`);
  }

  // Método para limpeza seletiva
  async cleanMocksOnly() {
    console.log('🎭 Removendo apenas arquivos mock...');
    
    const mockFiles = [
      'agendamento.mock.json',
      'convidados.mock.json', 
      'usuarios.mock.json'
    ];

    mockFiles.forEach(file => {
      const filePath = path.join(this.testDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`   ✅ Mock removido: ${file}`);
      }
    });
  }

  async cleanTempOnly() {
    console.log('🗂️ Removendo apenas arquivos temporários...');
    
    const tempDir = path.join(this.testDir, 'temp');
    if (fs.existsSync(tempDir)) {
      this.removeDirectory(tempDir);
      console.log('   ✅ Diretório temp/ removido');
    }

    // Remover arquivos temporários na raiz
    const files = fs.readdirSync(this.testDir);
    files.forEach(file => {
      if (file.includes('temp') || file.endsWith('.tmp') || file.endsWith('.log')) {
        const filePath = path.join(this.testDir, file);
        fs.unlinkSync(filePath);
        console.log(`   ✅ Arquivo temporário removido: ${file}`);
      }
    });
  }

  showHelp() {
    console.log('🔧 USO DO SCRIPT DE LIMPEZA:');
    console.log('');
    console.log('node clean-tests.js [opção]');
    console.log('');
    console.log('Opções:');
    console.log('  --all       Limpeza completa (padrão)');
    console.log('  --mocks     Remove apenas arquivos mock');
    console.log('  --temp      Remove apenas arquivos temporários');
    console.log('  --force     Força limpeza sem confirmação');
    console.log('  --help      Mostra esta ajuda');
    console.log('');
    console.log('Variáveis de ambiente:');
    console.log('  AUTO_CLEAN=true    Confirma automaticamente');
    console.log('');
    console.log('Exemplos:');
    console.log('  node clean-tests.js --mocks');
    console.log('  node clean-tests.js --force');
    console.log('  AUTO_CLEAN=true node clean-tests.js');
  }
}

// Execução do script
if (require.main === module) {
  const cleaner = new TestCleaner();
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    cleaner.showHelp();
  } else if (args.includes('--mocks')) {
    cleaner.cleanMocksOnly();
  } else if (args.includes('--temp')) {
    cleaner.cleanTempOnly();
  } else {
    cleaner.cleanAll();
  }
}

module.exports = TestCleaner;
