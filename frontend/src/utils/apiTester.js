/**
 * Testador de API para verificar se todos os endpoints estão funcionando
 */
import { 
  authService, 
  userService, 
  processService, 
  agendamentoService,
  notificacaoService,
  tabelaAuxiliarService,
  atualizacaoProcessoService,
  arquivoService
} from '../api/services';

class ApiTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  // Executar todos os testes
  async runAllTests() {
    // console.log removido
    
    // Primeiro, fazer login para obter token
    const loginResult = await this.testLogin();
    if (!loginResult.success) {
    // console.error removido
      return this.results;
    }

    const token = loginResult.token;

    // Testar endpoints que requerem autenticação
    await this.testAuthEndpoints(token);
    await this.testUserEndpoints(token);
    await this.testProcessEndpoints(token);
    await this.testAgendamentoEndpoints(token);
    await this.testNotificacaoEndpoints(token);
    await this.testTabelaEndpoints(token);
    await this.testAtualizacaoEndpoints(token);
    await this.testArquivoEndpoints(token);

    this.printResults();
    return this.results;
  }

  // Testar login
  async testLogin() {
    try {
      const result = await authService.login('admin@npj.com', 'admin123');
      if (result.success && result.token) {
        this.addTest('POST /auth/login', true, 'Login realizado com sucesso');
        return { success: true, token: result.token };
      } else {
        this.addTest('POST /auth/login', false, 'Login falhou');
        return { success: false };
      }
    } catch (error) {
      this.addTest('POST /auth/login', false, `Erro: ${error.message}`);
    }
  }

  // Testar endpoints de autenticação
  async testAuthEndpoints(token) {
    // GET /auth/perfil
    try {
      const perfil = await authService.getPerfil(token);
      this.addTest('GET /auth/perfil', !!perfil, perfil ? 'Perfil obtido' : 'Perfil não encontrado');
    } catch (error) {
      this.addTest('GET /auth/perfil', false, `Erro: ${error.message}`);
    }
  }

  // Testar endpoints de usuários
  async testUserEndpoints(token) {
    // GET /api/usuarios
    try {
      const users = await userService.listUsers(token);
      this.addTest('GET /api/usuarios', !!users, users ? `${users.length || 0} usuários encontrados` : 'Nenhum usuário');
    } catch (error) {
      this.addTest('GET /api/usuarios', false, `Erro: ${error.message}`);
    }
  }

  // Testar endpoints de processos
  async testProcessEndpoints(token) {
    // GET /api/processos
    try {
      const processes = await processService.listProcesses(token);
      this.addTest('GET /api/processos', !!processes, processes ? `${processes.length || 0} processos encontrados` : 'Nenhum processo');
    } catch (error) {
      this.addTest('GET /api/processos', false, `Erro: ${error.message}`);
    }

    // GET /api/processos/usuario
    try {
      const userProcesses = await processService.getProcessosUsuario(token);
      this.addTest('GET /api/processos/usuario', !!userProcesses, userProcesses ? `${userProcesses.length || 0} processos do usuário` : 'Nenhum processo do usuário');
    } catch (error) {
      this.addTest('GET /api/processos/usuario', false, `Erro: ${error.message}`);
    }
  }

  // Testar endpoints de agendamentos
  async testAgendamentoEndpoints(token) {
    // GET /api/agendamentos
    try {
      const agendamentos = await agendamentoService.listAgendamentos(token);
      this.addTest('GET /api/agendamentos', !!agendamentos, agendamentos ? `${agendamentos.length || 0} agendamentos encontrados` : 'Nenhum agendamento');
    } catch (error) {
      this.addTest('GET /api/agendamentos', false, `Erro: ${error.message}`);
    }

    // GET /api/agendamentos/usuario
    try {
      const userAgendamentos = await agendamentoService.listAgendamentosUsuario(token);
      this.addTest('GET /api/agendamentos/usuario', !!userAgendamentos, userAgendamentos ? `${userAgendamentos.length || 0} agendamentos do usuário` : 'Nenhum agendamento do usuário');
    } catch (error) {
      this.addTest('GET /api/agendamentos/usuario', false, `Erro: ${error.message}`);
    }
  }

  // Testar endpoints de notificações
  async testNotificacaoEndpoints(token) {
    // GET /api/notificacoes
    try {
      const notificacoes = await notificacaoService.listNotificacoes(token);
      this.addTest('GET /api/notificacoes', !!notificacoes, notificacoes ? `${notificacoes.length || 0} notificações encontradas` : 'Nenhuma notificação');
    } catch (error) {
      this.addTest('GET /api/notificacoes', false, `Erro: ${error.message}`);
    }

    // GET /api/notificacoes/nao-lidas/count
    try {
      const count = await notificacaoService.countNaoLidas(token);
      this.addTest('GET /api/notificacoes/nao-lidas/count', count !== undefined, `${count || 0} notificações não lidas`);
    } catch (error) {
      this.addTest('GET /api/notificacoes/nao-lidas/count', false, `Erro: ${error.message}`);
    }
  }

  // Testar endpoints de tabelas auxiliares
  async testTabelaEndpoints(token) {
    // GET /api/tabelas/roles
    try {
      const roles = await tabelaAuxiliarService.getRoles(token);
      this.addTest('GET /api/tabelas/roles', !!roles, roles ? `${roles.length || 0} roles encontradas` : 'Nenhuma role');
    } catch (error) {
      this.addTest('GET /api/tabelas/roles', false, `Erro: ${error.message}`);
    }
  }

  // Testar endpoints de atualizações
  async testAtualizacaoEndpoints(token) {
    // GET /api/atualizacoes
    try {
      const atualizacoes = await atualizacaoProcessoService.listAtualizacoes(token);
      this.addTest('GET /api/atualizacoes', !!atualizacoes, atualizacoes ? `${atualizacoes.length || 0} atualizações encontradas` : 'Nenhuma atualização');
    } catch (error) {
      this.addTest('GET /api/atualizacoes', false, `Erro: ${error.message}`);
    }
  }

  // Testar endpoints de arquivos
  async testArquivoEndpoints(token) {
    // GET /api/arquivos
    try {
      const arquivos = await arquivoService.listArquivos(token);
      this.addTest('GET /api/arquivos', !!arquivos, arquivos ? `${arquivos.length || 0} arquivos encontrados` : 'Nenhum arquivo');
    } catch (error) {
      this.addTest('GET /api/arquivos', false, `Erro: ${error.message}`);
    }
  }

  // Adicionar resultado de teste
  addTest(endpoint, passed, message) {
    this.results.tests.push({ endpoint, passed, message });
    if (passed) {
      this.results.passed++;
    } else {
      this.results.failed++;
    }
  }

  // Imprimir resultados
  printResults() {
    console.log('\n📊 RESULTADOS DOS TESTES');
    console.log('========================');
    
    this.results.tests.forEach(test => {
      const icon = test.passed ? '✅' : '❌';
      console.log(`${icon} ${test.endpoint} - ${test.message}`);
    });

    console.log('\n📈 RESUMO');
    console.log('=========');
    console.log(`✅ Testes passaram: ${this.results.passed}`);
    console.log(`❌ Testes falharam: ${this.results.failed}`);
    console.log(`📊 Taxa de sucesso: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
  }
}

// Executar testes se estiver em desenvolvimento
if (import.meta.env.DEV) {
  window.testAPI = () => {
    const tester = new ApiTester();
    return tester.runAllTests();
  };
  
    // console.log removido
}

export default ApiTester;
