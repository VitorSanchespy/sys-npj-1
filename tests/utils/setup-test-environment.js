#!/usr/bin/env node

/**
 * Script de Preparação do Ambiente de Testes
 * 
 * Este script prepara o ambiente para execução dos testes massivos:
 * - Verifica dependências
 * - Instala pacotes necessários
 * - Valida configuração
 * - Prepara dados de teste
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function execPromise(command, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

class TestEnvironmentSetup {
  constructor() {
    this.requiredPackages = [
      'axios',
      'playwright'
    ];
    this.optionalPackages = [
      '@playwright/test'
    ];
  }

  // Verificar se Node.js está na versão adequada
  async checkNodeVersion() {
    log('🔍 Verificando versão do Node.js...', 'yellow');
    
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
    
    if (majorVersion >= 16) {
      log(`✅ Node.js ${nodeVersion} - Compatível`, 'green');
      return true;
    } else {
      log(`❌ Node.js ${nodeVersion} - Versão muito antiga (mínimo: v16)`, 'red');
      return false;
    }
  }

  // Verificar se package.json existe
  checkPackageJson() {
    log('🔍 Verificando package.json...', 'yellow');
    
    if (fs.existsSync('package.json')) {
      log('✅ package.json encontrado', 'green');
      return true;
    } else {
      log('❌ package.json não encontrado', 'red');
      log('💡 Execute: npm init -y', 'yellow');
      return false;
    }
  }

  // Instalar dependências necessárias
  async installDependencies() {
    log('📦 Instalando dependências de teste...', 'yellow');
    
    try {
      // Verificar quais pacotes já estão instalados
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const installedDeps = {
        ...packageJson.dependencies || {},
        ...packageJson.devDependencies || {}
      };
      
      const toInstall = this.requiredPackages.filter(pkg => !installedDeps[pkg]);
      
      if (toInstall.length === 0) {
        log('✅ Todas as dependências já estão instaladas', 'green');
        return true;
      }
      
      log(`📦 Instalando: ${toInstall.join(', ')}`, 'blue');
      
      const installCommand = `npm install ${toInstall.join(' ')} --save-dev`;
      await execPromise(installCommand);
      
      log('✅ Dependências instaladas com sucesso', 'green');
      return true;
    } catch (error) {
      log('❌ Erro ao instalar dependências:', 'red');
      log(error.stderr || error.error.message, 'red');
      return false;
    }
  }

  // Configurar Playwright se necessário
  async setupPlaywright() {
    log('🎭 Configurando Playwright...', 'yellow');
    
    try {
      // Verificar se Playwright está instalado
      await execPromise('npx playwright --version');
      log('✅ Playwright já está configurado', 'green');
      return true;
    } catch (error) {
      log('⚠️ Playwright não encontrado, tentando instalar browsers...', 'yellow');
      
      try {
        await execPromise('npx playwright install chromium');
        log('✅ Playwright configurado com sucesso', 'green');
        return true;
      } catch (installError) {
        log('❌ Erro ao configurar Playwright:', 'red');
        log('💡 Execute manualmente: npx playwright install', 'yellow');
        return false;
      }
    }
  }

  // Verificar estrutura de arquivos de teste
  checkTestFiles() {
    log('📁 Verificando arquivos de teste...', 'yellow');
    
    const requiredFiles = [
      'test-endpoints-complete.js',
      'test-frontend-e2e.js',
      'run-all-tests.js'
    ];
    
    let allPresent = true;
    
    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        log(`✅ ${file} encontrado`, 'green');
      } else {
        log(`❌ ${file} não encontrado`, 'red');
        allPresent = false;
      }
    });
    
    return allPresent;
  }

  // Verificar configuração do backend
  async checkBackendConfig() {
    log('🔧 Verificando configuração do backend...', 'yellow');
    
    // Verificar .env
    if (fs.existsSync('backend/.env') || fs.existsSync('.env')) {
      log('✅ Arquivo .env encontrado', 'green');
    } else {
      log('⚠️ Arquivo .env não encontrado', 'yellow');
      this.createSampleEnv();
    }
    
    // Verificar package.json do backend
    if (fs.existsSync('backend/package.json')) {
      log('✅ Backend package.json encontrado', 'green');
      return true;
    } else {
      log('❌ Backend package.json não encontrado', 'red');
      return false;
    }
  }

  // Criar arquivo .env de exemplo
  createSampleEnv() {
    log('📝 Criando .env de exemplo...', 'blue');
    
    const envContent = `# Configuração do Servidor
PORT=3001

# Configuração do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=npj_system
DB_USER=postgres
DB_PASS=123456

# Chaves de Segurança
JWT_SECRET=sua_chave_super_secreta_aqui
REFRESH_TOKEN_SECRET=sua_chave_refresh_token_aqui

# Google Calendar (opcional)
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret

# Configuração de Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app
`;
    
    fs.writeFileSync('backend/.env', envContent);
    log('✅ Arquivo .env criado em backend/.env', 'green');
    log('💡 Configure as variáveis de acordo com seu ambiente', 'yellow');
  }

  // Verificar se serviços estão rodando
  async checkServices() {
    log('🔍 Verificando serviços...', 'yellow');
    
    // Verificar backend
    try {
      const axios = require('axios');
      await axios.get('http://localhost:3001', { timeout: 3000 });
      log('✅ Backend rodando na porta 3001', 'green');
    } catch (error) {
      log('⚠️ Backend não está rodando na porta 3001', 'yellow');
      log('💡 Execute: ./start-local.bat ou npm run start no backend', 'blue');
    }
    
    // Verificar frontend
    try {
      const axios = require('axios');
      await axios.get('http://localhost:5173', { timeout: 3000 });
      log('✅ Frontend rodando na porta 5173', 'green');
    } catch (error) {
      log('⚠️ Frontend não está rodando na porta 5173', 'yellow');
      log('💡 Execute: npm run dev no diretório frontend', 'blue');
    }
  }

  // Criar dados de teste
  async createTestData() {
    log('👥 Verificando usuários de teste...', 'yellow');
    
    try {
      const axios = require('axios');
      
      // Tentar fazer login com usuários de teste
      const testUsers = [
        { email: 'admin@teste.com', senha: '123456', role: 'Admin' },
        { email: 'professor@teste.com', senha: '123456', role: 'Professor' },
        { email: 'aluno@teste.com', senha: '123456', role: 'Aluno' }
      ];
      
      for (const user of testUsers) {
        try {
          await axios.post('http://localhost:3001/api/auth/login', {
            email: user.email,
            senha: user.senha
          });
          log(`✅ Usuário ${user.role} existe`, 'green');
        } catch (error) {
          log(`⚠️ Usuário ${user.role} não encontrado`, 'yellow');
          log(`💡 Será necessário criar: ${user.email}`, 'blue');
        }
      }
    } catch (error) {
      log('⚠️ Não foi possível verificar usuários (backend offline)', 'yellow');
    }
  }

  // Criar scripts no package.json
  updatePackageJsonScripts() {
    log('📝 Atualizando scripts do package.json...', 'yellow');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }
      
      // Adicionar scripts de teste
      packageJson.scripts['test:all'] = 'node run-all-tests.js';
      packageJson.scripts['test:backend'] = 'node test-endpoints-complete.js';
      packageJson.scripts['test:frontend'] = 'node test-frontend-e2e.js';
      packageJson.scripts['test:setup'] = 'node setup-test-environment.js';
      
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
      log('✅ Scripts adicionados ao package.json', 'green');
      
      log('\n📋 Scripts disponíveis:', 'bright');
      log('• npm run test:all - Executar todos os testes', 'blue');
      log('• npm run test:backend - Apenas testes de backend', 'blue');
      log('• npm run test:frontend - Apenas testes de frontend', 'blue');
      log('• npm run test:setup - Configurar ambiente', 'blue');
      
    } catch (error) {
      log('❌ Erro ao atualizar package.json:', 'red');
      log(error.message, 'red');
    }
  }

  // Executar setup completo
  async run() {
    log('🚀 CONFIGURANDO AMBIENTE DE TESTES', 'bright');
    log('='.repeat(50), 'cyan');
    
    let success = true;
    
    // 1. Verificar Node.js
    if (!(await this.checkNodeVersion())) {
      success = false;
    }
    
    // 2. Verificar package.json
    if (!this.checkPackageJson()) {
      success = false;
    }
    
    // 3. Instalar dependências
    if (success && !(await this.installDependencies())) {
      success = false;
    }
    
    // 4. Configurar Playwright
    if (success) {
      await this.setupPlaywright(); // Não bloqueia se falhar
    }
    
    // 5. Verificar arquivos de teste
    if (!this.checkTestFiles()) {
      log('⚠️ Alguns arquivos de teste não foram encontrados', 'yellow');
    }
    
    // 6. Verificar configuração do backend
    await this.checkBackendConfig();
    
    // 7. Verificar serviços
    await this.checkServices();
    
    // 8. Verificar dados de teste
    await this.createTestData();
    
    // 9. Atualizar scripts
    this.updatePackageJsonScripts();
    
    // Resumo final
    log('\n' + '='.repeat(50), 'cyan');
    if (success) {
      log('✅ AMBIENTE CONFIGURADO COM SUCESSO!', 'green');
      log('\n📋 Próximos passos:', 'bright');
      log('1. Inicie o backend: ./start-local.bat', 'blue');
      log('2. Inicie o frontend: cd frontend && npm run dev', 'blue');
      log('3. Execute os testes: npm run test:all', 'blue');
    } else {
      log('❌ PROBLEMAS ENCONTRADOS NA CONFIGURAÇÃO', 'red');
      log('Corrija os erros acima antes de executar os testes', 'yellow');
    }
    log('='.repeat(50), 'cyan');
    
    return success;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const setup = new TestEnvironmentSetup();
  setup.run()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error.message);
      process.exit(1);
    });
}

module.exports = TestEnvironmentSetup;
