#!/usr/bin/env node

/**
 * DIAGNÓSTICO COMPLETO - SISTEMA NPJ
 * Alinhamento Frontend & Backend
 */

const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:5173';

class DiagnosticoNPJ {
  constructor() {
    this.tokens = {
      admin: null,
      professor: null,
      aluno: null
    };
    this.resultados = {
      autenticacao: {},
      processos: {},
      dashboard: {},
      agendamentos: {},
      perfil: {},
      problemas: []
    };
  }

  // Utilitário para logar resultados
  log(secao, status, mensagem, detalhes = null) {
    const timestamp = new Date().toISOString();
    const emoji = status === 'SUCESSO' ? '✅' : status === 'ERRO' ? '❌' : '⚠️';
    
    console.log(`${emoji} [${secao}] ${mensagem}`);
    
    if (detalhes) {
      console.log(`   └─ ${JSON.stringify(detalhes, null, 2)}`);
    }

    // Armazenar para relatório
    if (!this.resultados[secao.toLowerCase()]) {
      this.resultados[secao.toLowerCase()] = {};
    }
    this.resultados[secao.toLowerCase()][mensagem] = { status, detalhes, timestamp };
  }

  // 1. TESTE DE AUTENTICAÇÃO
  async testarAutenticacao() {
    console.log('\n🔐 TESTE 1: AUTENTICAÇÃO');
    console.log('================================');

    const usuarios = [
      { tipo: 'professor', email: 'professor@npj.com', senha: '123456' },
      { tipo: 'aluno', email: 'aluno@npj.com', senha: '123456' }
    ];

    for (const usuario of usuarios) {
      try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: usuario.email,
          senha: usuario.senha
        });

        if (response.data.token) {
          this.tokens[usuario.tipo] = response.data.token;
          this.log('AUTENTICACAO', 'SUCESSO', `Login ${usuario.tipo}`, {
            token: response.data.token.substring(0, 20) + '...',
            usuario: response.data.usuario?.nome
          });
        } else {
          this.log('AUTENTICACAO', 'ERRO', `Login ${usuario.tipo} - sem token`);
        }
      } catch (error) {
        this.log('AUTENTICACAO', 'ERRO', `Login ${usuario.tipo}`, {
          status: error.response?.status,
          message: error.response?.data?.erro || error.message
        });
      }
    }
  }

  // 2. TESTE DE PROCESSOS
  async testarProcessos() {
    console.log('\n⚖️ TESTE 2: PROCESSOS');
    console.log('================================');

    // Testar listagem
    for (const [tipo, token] of Object.entries(this.tokens)) {
      if (!token) continue;

      try {
        const response = await axios.get(`${BASE_URL}/api/processos`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.log('PROCESSOS', 'SUCESSO', `Listagem ${tipo}`, {
          total: response.data.length,
          primeiro: response.data[0]?.numero_processo
        });

        // Testar criação (só para professor e admin)
        if (tipo !== 'aluno') {
          const novoProcesso = {
            numero_processo: `TEST-${Date.now()}`,
            descricao: 'Processo de teste para diagnóstico',
            tipo_processo: 'Civil',
            status: 'Em andamento',
            cliente_nome: 'Cliente Teste',
            cliente_email: 'cliente@teste.com',
            responsavel_nome: 'Responsável Teste',
            responsavel_email: 'responsavel@teste.com'
          };

          const createResponse = await axios.post(`${BASE_URL}/api/processos`, novoProcesso, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const processoId = createResponse.data.processo?.id || createResponse.data.id;
          
          this.log('PROCESSOS', 'SUCESSO', `Criação ${tipo}`, {
            id: processoId,
            numero: createResponse.data.processo?.numero_processo || createResponse.data.numero_processo
          });

          // Testar atualização do processo criado
          if (processoId) {
            const updateData = {
              descricao: 'Processo atualizado - teste responsável',
              responsavel_nome: 'Responsável Atualizado',
              responsavel_email: 'atualizado@teste.com',
              responsavel_telefone: '(11) 99999-9999'
            };

            const updateResponse = await axios.put(`${BASE_URL}/api/processos/${processoId}`, updateData, {
              headers: { Authorization: `Bearer ${token}` }
            });

            // Verificar se responsável foi mantido
            const getResponse = await axios.get(`${BASE_URL}/api/processos/${processoId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });

            const processo = getResponse.data;
            
            if (processo.responsavel_nome && processo.responsavel_email) {
              this.log('PROCESSOS', 'SUCESSO', `Atualização ${tipo} - responsável mantido`, {
                responsavel_nome: processo.responsavel_nome,
                responsavel_email: processo.responsavel_email
              });
            } else {
              this.log('PROCESSOS', 'ERRO', `Atualização ${tipo} - responsável perdido`, {
                responsavel_nome: processo.responsavel_nome,
                responsavel_email: processo.responsavel_email,
                processo_id: processoId
              });
              this.resultados.problemas.push('PROBLEMA CRÍTICO: Responsável sumindo na atualização de processo');
            }
          }
        }

      } catch (error) {
        this.log('PROCESSOS', 'ERRO', `Operação ${tipo}`, {
          status: error.response?.status,
          message: error.response?.data?.erro || error.message
        });
      }
    }
  }

  // 3. TESTE DE DASHBOARD
  async testarDashboard() {
    console.log('\n📊 TESTE 3: DASHBOARD');
    console.log('================================');

    for (const [tipo, token] of Object.entries(this.tokens)) {
      if (!token) continue;

      try {
        // Testar estatísticas
        const statsResponse = await axios.get(`${BASE_URL}/api/dashboard/estatisticas`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const stats = statsResponse.data;
        this.log('DASHBOARD', 'SUCESSO', `Estatísticas ${tipo}`, {
          totalProcessos: stats.totalProcessos,
          totalUsuarios: stats.totalUsuarios,
          usuariosAtivos: stats.usuariosAtivos,
          temPorcentagens: !!stats.taxaAtivos
        });

        // Testar exportação de PDF
        try {
          const pdfResponse = await axios.get(`${BASE_URL}/api/dashboard/exportar`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'arraybuffer'
          });

          if (pdfResponse.headers['content-type']?.includes('pdf')) {
            this.log('DASHBOARD', 'SUCESSO', `Exportação PDF ${tipo}`, {
              tamanho: pdfResponse.data.length,
              contentType: pdfResponse.headers['content-type']
            });
          } else {
            this.log('DASHBOARD', 'ERRO', `Exportação PDF ${tipo} - não é PDF`, {
              contentType: pdfResponse.headers['content-type']
            });
          }
        } catch (pdfError) {
          this.log('DASHBOARD', 'ERRO', `Exportação PDF ${tipo}`, {
            status: pdfError.response?.status,
            message: pdfError.response?.data?.erro || pdfError.message
          });
          this.resultados.problemas.push('PROBLEMA: Exportação de PDF não funciona');
        }

      } catch (error) {
        this.log('DASHBOARD', 'ERRO', `Dashboard ${tipo}`, {
          status: error.response?.status,
          message: error.response?.data?.erro || error.message
        });
      }
    }
  }

  // 4. TESTE DE AGENDAMENTOS
  async testarAgendamentos() {
    console.log('\n📅 TESTE 4: AGENDAMENTOS');
    console.log('================================');

    for (const [tipo, token] of Object.entries(this.tokens)) {
      if (!token) continue;

      try {
        // Testar listagem
        const listResponse = await axios.get(`${BASE_URL}/api/agendamentos`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.log('AGENDAMENTOS', 'SUCESSO', `Listagem ${tipo}`, {
          total: listResponse.data.length
        });

        // Testar criação
        const novoAgendamento = {
          titulo: `Teste Agendamento ${tipo} - ${Date.now()}`,
          descricao: 'Agendamento de teste para diagnóstico',
          data_inicio: new Date(Date.now() + 86400000).toISOString(), // Amanhã
          data_fim: new Date(Date.now() + 86400000 + 3600000).toISOString(), // Amanhã + 1h
          local: 'Sala de testes',
          tipo: 'reuniao'
        };

        const createResponse = await axios.post(`${BASE_URL}/api/agendamentos`, novoAgendamento, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const agendamentoId = createResponse.data.id;
        
        this.log('AGENDAMENTOS', 'SUCESSO', `Criação ${tipo}`, {
          id: agendamentoId,
          titulo: createResponse.data.titulo
        });

        // Testar atualização
        if (agendamentoId) {
          const updateData = {
            titulo: `Agendamento Atualizado ${tipo}`,
            descricao: 'Descrição atualizada'
          };

          const updateResponse = await axios.put(`${BASE_URL}/api/agendamentos/${agendamentoId}`, updateData, {
            headers: { Authorization: `Bearer ${token}` }
          });

          this.log('AGENDAMENTOS', 'SUCESSO', `Atualização ${tipo}`, {
            id: agendamentoId,
            titulo: updateResponse.data.titulo
          });
        }

      } catch (error) {
        this.log('AGENDAMENTOS', 'ERRO', `Operação ${tipo}`, {
          status: error.response?.status,
          message: error.response?.data?.erro || error.message
        });
        
        if (error.response?.status >= 400) {
          this.resultados.problemas.push(`PROBLEMA: Agendamentos ${tipo} - ${error.response?.data?.erro || error.message}`);
        }
      }
    }
  }

  // 5. TESTE DE PERFIL
  async testarPerfil() {
    console.log('\n👤 TESTE 5: PERFIL DE USUÁRIO');
    console.log('================================');

    for (const [tipo, token] of Object.entries(this.tokens)) {
      if (!token) continue;

      try {
        // Testar obtenção do perfil
        const perfilResponse = await axios.get(`${BASE_URL}/api/usuarios/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.log('PERFIL', 'SUCESSO', `Obter perfil ${tipo}`, {
          id: perfilResponse.data.id,
          nome: perfilResponse.data.nome,
          email: perfilResponse.data.email
        });

        // Testar atualização do perfil
        const updateData = {
          nome: `${perfilResponse.data.nome} - Atualizado`,
          telefone: '(11) 99999-8888'
        };

        const updateResponse = await axios.put(`${BASE_URL}/api/usuarios/me`, updateData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.log('PERFIL', 'SUCESSO', `Atualizar perfil ${tipo}`, {
          nome: updateResponse.data.nome,
          telefone: updateResponse.data.telefone
        });

        // Testar atualização de senha
        try {
          const senhaResponse = await axios.put(`${BASE_URL}/api/usuarios/me/senha`, {
            senhaAtual: '123456',
            novaSenha: '123456' // Mantém a mesma para não quebrar outros testes
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          this.log('PERFIL', 'SUCESSO', `Atualizar senha ${tipo}`, {
            message: senhaResponse.data.message
          });
        } catch (senhaError) {
          this.log('PERFIL', 'ERRO', `Atualizar senha ${tipo}`, {
            status: senhaError.response?.status,
            message: senhaError.response?.data?.erro || senhaError.message
          });
          this.resultados.problemas.push(`PROBLEMA: Atualização de senha ${tipo} falhou`);
        }

      } catch (error) {
        this.log('PERFIL', 'ERRO', `Perfil ${tipo}`, {
          status: error.response?.status,
          message: error.response?.data?.erro || error.message
        });
      }
    }
  }

  // 6. RELATÓRIO FINAL
  gerarRelatorio() {
    console.log('\n📋 RELATÓRIO FINAL DO DIAGNÓSTICO');
    console.log('=========================================');

    const problemas = this.resultados.problemas;
    
    if (problemas.length === 0) {
      console.log('✅ NENHUM PROBLEMA CRÍTICO IDENTIFICADO!');
    } else {
      console.log('❌ PROBLEMAS IDENTIFICADOS:');
      problemas.forEach((problema, index) => {
        console.log(`   ${index + 1}. ${problema}`);
      });
    }

    // Salvar relatório detalhado
    const relatorio = {
      timestamp: new Date().toISOString(),
      problemas: problemas,
      resultados: this.resultados,
      resumo: {
        totalTestes: Object.values(this.resultados).reduce((acc, secao) => {
          return acc + Object.keys(secao).length;
        }, 0) - 1, // -1 porque 'problemas' não é uma seção de testes
        problemasEncontrados: problemas.length
      }
    };

    fs.writeFileSync('diagnostico-completo-resultado.json', JSON.stringify(relatorio, null, 2));
    console.log('\n📄 Relatório detalhado salvo em: diagnostico-completo-resultado.json');

    return relatorio;
  }

  // Executar todos os testes
  async executar() {
    console.log('🚀 INICIANDO DIAGNÓSTICO COMPLETO DO SISTEMA NPJ');
    console.log('================================================');

    try {
      await this.testarAutenticacao();
      await this.testarProcessos();
      await this.testarDashboard();
      await this.testarAgendamentos();
      await this.testarPerfil();
      
      return this.gerarRelatorio();
    } catch (error) {
      console.error('❌ Erro geral no diagnóstico:', error.message);
      return null;
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const diagnostico = new DiagnosticoNPJ();
  diagnostico.executar().then((resultado) => {
    if (resultado) {
      console.log('\n🎯 DIAGNÓSTICO CONCLUÍDO!');
      process.exit(resultado.problemas.length > 0 ? 1 : 0);
    } else {
      console.log('\n💥 DIAGNÓSTICO FALHOU!');
      process.exit(1);
    }
  });
}

module.exports = DiagnosticoNPJ;
