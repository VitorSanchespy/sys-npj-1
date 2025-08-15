const cron = require('node-cron');
const Agendamento = require('../models/agendamentoModel');
const emailService = require('../services/emailService');

class LembreteJob {
  constructor() {
    this.isRunning = false;
    this.job = null;
  }

  // Iniciar o job automático para rodar a cada 30 minutos
  iniciar() {
    console.log('🔄 Iniciando job automático de lembretes de agendamentos...');
    
    // Executa a cada 30 minutos: '0 */30 * * * *'
    // Para testes, pode usar a cada minuto: '* * * * *'
    this.job = cron.schedule('0 */30 * * * *', async () => {
      if (this.isRunning) {
        console.log('⏳ Job de lembretes já está em execução, pulando...');
        return;
      }

      await this.executarLembretes();
    }, {
      scheduled: true,
      timezone: 'America/Cuiaba' // Fuso horário de Mato Grosso
    });

    console.log('✅ Job de lembretes iniciado com sucesso');
  }

  // Parar o job
  parar() {
    if (this.job) {
      this.job.stop();
      console.log('🛑 Job de lembretes parado');
    }
  }

  // Executar envio de lembretes
  async executarLembretes() {
    this.isRunning = true;
    console.log('📧 Iniciando execução de lembretes de agendamentos...');

    try {
      // Buscar agendamentos pendentes de lembrete
      const agendamentos = await Agendamento.findPendentesLembrete();
      
      if (agendamentos.length === 0) {
        console.log('📭 Nenhum agendamento pendente de lembrete encontrado');
        return;
      }

      console.log(`📬 ${agendamentos.length} agendamento(s) encontrado(s) para envio de lembrete`);

      let sucessos = 0;
      let erros = 0;

      // Processar cada agendamento
      for (const agendamento of agendamentos) {
        try {
          console.log(`📤 Enviando lembrete para agendamento: ${agendamento.titulo} (ID: ${agendamento.id})`);
          
          // Enviar lembrete
          await emailService.enviarLembreteAgendamento(agendamento);
          
          // Marcar como enviado
          await agendamento.marcarLembreteEnviado();
          
          sucessos++;
          console.log(`✅ Lembrete enviado com sucesso para agendamento ID: ${agendamento.id}`);
          
        } catch (error) {
          erros++;
          console.error(`❌ Erro ao enviar lembrete para agendamento ID: ${agendamento.id}`, error.message);
        }
      }

      console.log(`📊 Resumo do job de lembretes:`);
      console.log(`   ✅ Sucessos: ${sucessos}`);
      console.log(`   ❌ Erros: ${erros}`);
      console.log(`   📧 Total processados: ${agendamentos.length}`);

    } catch (error) {
      console.error('💥 Erro geral no job de lembretes:', error);
    } finally {
      this.isRunning = false;
      console.log('🏁 Execução de lembretes finalizada');
    }
  }

  // Executar manualmente (para testes)
  async executarManual() {
    console.log('🚀 Executando job de lembretes manualmente...');
    await this.executarLembretes();
  }

  // Verificar se o job está rodando
  isJobRunning() {
    return this.isRunning;
  }

  // Verificar status do job
  getStatus() {
    return {
      ativo: this.job ? this.job.running : false,
      executando: this.isRunning,
      proximaExecucao: this.job ? this.job.nextDate() : null
    };
  }
}

// Exportar instância única
const lembreteJob = new LembreteJob();

module.exports = lembreteJob;
