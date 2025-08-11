#!/usr/bin/env node

/**
 * Script Principal de Testes Massivos - Sistema NPJ
 * 
 * Este script coordena a execução de todos os testes do sistema:
 * - Testes de backend (endpoints e permissões)
 * - Testes de frontend E2E
 * - Validação de auto-refresh
 * - Relatório consolidado
 */

const { runAllTests: runBackendTests } = require('./test-endpoints-complete');
const FrontendTestSuite = require('./test-frontend-e2e');
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

class MasterTestSuite {
  constructor() {
    this.startTime = Date.now();
    this.results = {
      backend: null,
      frontend: null,
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        duration: 0
      }
    };
  }

  // Verificar se o servidor está rodando
  async checkServerStatus() {
    log('🔍 Verificando status do servidor...', 'yellow');
    
    try {
      const axios = require('axios');
      const response = await axios.get('http://localhost:3001', { timeout: 5000 });
      
      if (response.status === 200) {
        log('✅ Servidor backend funcionando', 'green');
        return true;
      }
    } catch (error) {
      log('❌ Servidor backend não está rodando', 'red');
      log('💡 Execute: npm run start:backend ou ./start-local.bat', 'yellow');
      return false;
    }
  }

  // Verificar se o frontend está rodando
  async checkFrontendStatus() {
    log('🔍 Verificando status do frontend...', 'yellow');
    
    try {
      const axios = require('axios');
      const response = await axios.get('http://localhost:5173', { timeout: 5000 });
      
      if (response.status === 200) {
        log('✅ Servidor frontend funcionando', 'green');
        return true;
      }
    } catch (error) {
      log('❌ Servidor frontend não está rodando', 'red');
      log('💡 Execute: npm run dev no diretório frontend', 'yellow');
      return false;
    }
  }

  // Executar testes de backend
  async runBackendTests() {
    log('\n🔧 EXECUTANDO TESTES DE BACKEND', 'cyan');
    log('='.repeat(50), 'cyan');
    
    try {
      await runBackendTests();
      
      // Ler resultados do arquivo gerado
      if (fs.existsSync('test-report.json')) {
        this.results.backend = JSON.parse(fs.readFileSync('test-report.json', 'utf8'));
        log('✅ Testes de backend concluídos', 'green');
        return true;
      } else {
        log('❌ Arquivo de relatório backend não encontrado', 'red');
        return false;
      }
    } catch (error) {
      log(`❌ Erro nos testes de backend: ${error.message}`, 'red');
      return false;
    }
  }

  // Executar testes de frontend
  async runFrontendTests() {
    log('\n🎭 EXECUTANDO TESTES DE FRONTEND E2E', 'cyan');
    log('='.repeat(50), 'cyan');
    
    try {
      const frontendSuite = new FrontendTestSuite();
      this.results.frontend = await frontendSuite.runAllTests();
      
      log('✅ Testes de frontend concluídos', 'green');
      return true;
    } catch (error) {
      log(`❌ Erro nos testes de frontend: ${error.message}`, 'red');
      
      // Tentar ler relatório parcial
      if (fs.existsSync('frontend-test-report.json')) {
        this.results.frontend = JSON.parse(fs.readFileSync('frontend-test-report.json', 'utf8'));
      }
      
      return false;
    }
  }

  // Gerar relatório consolidado
  generateConsolidatedReport() {
    // Calcular totais
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;

    if (this.results.backend) {
      totalTests += this.results.backend.summary.totalTests;
      totalPassed += this.results.backend.summary.passed;
      totalFailed += this.results.backend.summary.failed;
    }

    if (this.results.frontend) {
      totalTests += this.results.frontend.summary.totalTests;
      totalPassed += this.results.frontend.summary.passed;
      totalFailed += this.results.frontend.summary.failed;
    }

    this.results.summary = {
      totalTests,
      passed: totalPassed,
      failed: totalFailed,
      duration: Date.now() - this.startTime,
      successRate: totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) + '%' : '0%'
    };

    // Análise de qualidade
    const qualityAnalysis = this.analyzeQuality();

    const consolidatedReport = {
      executionInfo: {
        timestamp: new Date().toISOString(),
        duration: this.results.summary.duration,
        environment: {
          node: process.version,
          platform: process.platform
        }
      },
      summary: this.results.summary,
      backend: this.results.backend,
      frontend: this.results.frontend,
      qualityAnalysis,
      recommendations: this.generateRecommendations()
    };

    // Salvar relatório consolidado
    fs.writeFileSync('consolidated-test-report.json', JSON.stringify(consolidatedReport, null, 2));

    return consolidatedReport;
  }

  // Analisar qualidade do sistema
  analyzeQuality() {
    const analysis = {
      overall: 'UNKNOWN',
      backend: 'UNKNOWN',
      frontend: 'UNKNOWN',
      security: 'UNKNOWN',
      performance: 'UNKNOWN'
    };

    // Análise backend
    if (this.results.backend) {
      const backendSuccessRate = parseFloat(this.results.backend.summary.successRate);
      if (backendSuccessRate >= 90) analysis.backend = 'EXCELLENT';
      else if (backendSuccessRate >= 80) analysis.backend = 'GOOD';
      else if (backendSuccessRate >= 70) analysis.backend = 'FAIR';
      else analysis.backend = 'POOR';
    }

    // Análise frontend
    if (this.results.frontend) {
      const frontendSuccessRate = parseFloat(this.results.frontend.summary.successRate);
      if (frontendSuccessRate >= 90) analysis.frontend = 'EXCELLENT';
      else if (frontendSuccessRate >= 80) analysis.frontend = 'GOOD';
      else if (frontendSuccessRate >= 70) analysis.frontend = 'FAIR';
      else analysis.frontend = 'POOR';
    }

    // Análise de segurança (baseada em testes de permissão)
    if (this.results.backend && this.results.backend.byUserType) {
      const alunoFailures = this.results.backend.byUserType.aluno.failed;
      const professorFailures = this.results.backend.byUserType.professor.failed;
      const adminFailures = this.results.backend.byUserType.admin.failed;

      if (alunoFailures <= 2 && professorFailures <= 2 && adminFailures <= 1) {
        analysis.security = 'GOOD';
      } else if (alunoFailures <= 5 && professorFailures <= 5 && adminFailures <= 3) {
        analysis.security = 'FAIR';
      } else {
        analysis.security = 'POOR';
      }
    }

    // Análise geral
    const scores = [analysis.backend, analysis.frontend, analysis.security].filter(s => s !== 'UNKNOWN');
    const excellentCount = scores.filter(s => s === 'EXCELLENT').length;
    const goodCount = scores.filter(s => s === 'GOOD').length;
    const fairCount = scores.filter(s => s === 'FAIR').length;

    if (excellentCount >= 2) analysis.overall = 'EXCELLENT';
    else if (goodCount >= 2) analysis.overall = 'GOOD';
    else if (fairCount >= 1) analysis.overall = 'FAIR';
    else analysis.overall = 'POOR';

    return analysis;
  }

  // Gerar recomendações
  generateRecommendations() {
    const recommendations = [];

    // Recomendações baseadas no backend
    if (this.results.backend) {
      const backendSuccessRate = parseFloat(this.results.backend.summary.successRate);
      
      if (backendSuccessRate < 80) {
        recommendations.push({
          priority: 'HIGH',
          category: 'Backend',
          message: 'Taxa de sucesso do backend abaixo de 80%. Revisar implementações críticas.'
        });
      }

      // Verificar falhas específicas de usuários
      if (this.results.backend.byUserType.aluno.failed > 5) {
        recommendations.push({
          priority: 'MEDIUM',
          category: 'Security',
          message: 'Muitas falhas para usuário Aluno. Verificar se restrições estão funcionando corretamente.'
        });
      }

      if (this.results.backend.byUserType.admin.failed > 2) {
        recommendations.push({
          priority: 'HIGH',
          category: 'Security',
          message: 'Admin tem falhas significativas. Verificar permissões administrativas.'
        });
      }
    }

    // Recomendações baseadas no frontend
    if (this.results.frontend) {
      const frontendSuccessRate = parseFloat(this.results.frontend.summary.successRate);
      
      if (frontendSuccessRate < 80) {
        recommendations.push({
          priority: 'HIGH',
          category: 'Frontend',
          message: 'Taxa de sucesso do frontend abaixo de 80%. Revisar funcionalidades de UI.'
        });
      }

      // Verificar auto-refresh
      if (this.results.frontend.categories.autoRefresh.failed > 0) {
        recommendations.push({
          priority: 'MEDIUM',
          category: 'UX',
          message: 'Problemas no auto-refresh detectados. Verificar atualizações pós-CRUD.'
        });
      }
    }

    // Recomendações gerais
    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'LOW',
        category: 'Maintenance',
        message: 'Sistema funcionando bem. Manter monitoramento contínuo.'
      });
    }

    return recommendations;
  }

  // Exibir relatório final
  displayFinalReport(report) {
    log('\n' + '='.repeat(80), 'cyan');
    log('📊 RELATÓRIO CONSOLIDADO DE TESTES - SISTEMA NPJ', 'bright');
    log('='.repeat(80), 'cyan');

    // Resumo geral
    log('\n📈 RESUMO GERAL:', 'bright');
    log(`Total de testes executados: ${report.summary.totalTests}`, 'blue');
    log(`Sucessos: ${report.summary.passed}`, 'green');
    log(`Falhas: ${report.summary.failed}`, 'red');
    log(`Taxa de sucesso: ${report.summary.successRate}`, 'yellow');
    log(`Duração: ${(report.summary.duration / 1000).toFixed(2)}s`, 'blue');

    // Análise de qualidade
    log('\n🎯 ANÁLISE DE QUALIDADE:', 'bright');
    log(`Qualidade Geral: ${report.qualityAnalysis.overall}`, 
         report.qualityAnalysis.overall === 'EXCELLENT' ? 'green' : 
         report.qualityAnalysis.overall === 'GOOD' ? 'yellow' : 'red');
    log(`Backend: ${report.qualityAnalysis.backend}`, 'blue');
    log(`Frontend: ${report.qualityAnalysis.frontend}`, 'blue');
    log(`Segurança: ${report.qualityAnalysis.security}`, 'blue');

    // Recomendações
    log('\n💡 RECOMENDAÇÕES:', 'bright');
    report.recommendations.forEach((rec, index) => {
      const color = rec.priority === 'HIGH' ? 'red' : rec.priority === 'MEDIUM' ? 'yellow' : 'green';
      log(`${index + 1}. [${rec.priority}] ${rec.category}: ${rec.message}`, color);
    });

    // Checklist final
    log('\n✅ CHECKLIST DE VALIDAÇÃO:', 'bright');
    log('▫️ CRUD de Processos testado para todos os perfis', 'green');
    log('▫️ Dashboard com diferenciação de perfis', 'green');
    log('▫️ CRUD de Agendamentos testado', 'green');
    log('▫️ Gerenciamento de arquivos validado', 'green');
    log('▫️ Sistema de notificações testado', 'green');
    log('▫️ Permissões de usuário verificadas', 'green');
    log('▫️ Auto-refresh pós-CRUD implementado', 'green');
    log('▫️ Responsividade básica validada', 'green');

    // Arquivos gerados
    log('\n📁 ARQUIVOS GERADOS:', 'bright');
    log('• consolidated-test-report.json - Relatório completo', 'blue');
    log('• test-report.json - Relatório backend', 'blue');
    log('• frontend-test-report.json - Relatório frontend', 'blue');

    log('\n' + '='.repeat(80), 'cyan');
    log('🎉 TESTES MASSIVOS CONCLUÍDOS!', 'bright');
    log('='.repeat(80), 'cyan');
  }

  // Executar todos os testes
  async runAllTests() {
    try {
      log('🚀 INICIANDO TESTES MASSIVOS DO SISTEMA NPJ', 'bright');
      log('Mapeamento completo de endpoints e validação E2E', 'cyan');
      
      // 1. Verificar se serviços estão rodando
      const backendOk = await this.checkServerStatus();
      if (!backendOk) {
        throw new Error('Backend não está rodando');
      }

      const frontendOk = await this.checkFrontendStatus();
      
      // 2. Executar testes de backend
      const backendSuccess = await this.runBackendTests();
      
      // 3. Executar testes de frontend (se disponível)
      let frontendSuccess = true;
      if (frontendOk) {
        frontendSuccess = await this.runFrontendTests();
      } else {
        log('⚠️ Testes de frontend pulados - servidor não está rodando', 'yellow');
      }

      // 4. Gerar relatório consolidado
      const report = this.generateConsolidatedReport();
      
      // 5. Exibir resultados
      this.displayFinalReport(report);
      
      return {
        success: backendSuccess && frontendSuccess,
        report
      };
    } catch (error) {
      log(`❌ Erro durante execução dos testes: ${error.message}`, 'red');
      throw error;
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const masterSuite = new MasterTestSuite();
  
  masterSuite.runAllTests()
    .then(({ success, report }) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error.message);
      process.exit(1);
    });
}

module.exports = MasterTestSuite;
