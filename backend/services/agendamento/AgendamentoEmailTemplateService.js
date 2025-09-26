/**
 * Serviço de Templates de Email para Agendamentos
 * Centraliza todos os templates HTML/texto para emails do sistema de agendamentos
 */

const { 
  AGENDAMENTO_STATUS, 
  CONVIDADO_STATUS,
  AGENDAMENTO_TIPOS,
  USER_ROLES 
} = require('../../config/agendamento/constants');

const ConvidadoUtilsService = require('./ConvidadoUtilsService');

class AgendamentoEmailTemplateService {

  /**
   * Gera template de convite para agendamento
   * @param {Object} agendamento - Dados do agendamento
   * @param {Object} convidado - Dados do convidado específico
   * @param {string} linkResposta - Link para responder ao convite
   * @returns {Object} { subject, html, text }
   */
  static generateConviteTemplate(agendamento, convidado, linkResposta) {
    const dataFormatada = this.formatDate(agendamento.data_hora);
    const horaFormatada = this.formatTime(agendamento.data_hora);
    const tipoFormatado = this.formatTipo(agendamento.tipo);
    
    const subject = `Convite: ${agendamento.titulo} - ${dataFormatada}`;
    
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Convite para Agendamento</title>
        <style>
          ${this.getBaseStyles()}
          .convite-container { max-width: 600px; margin: 0 auto; }
          .convite-header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .convite-body { padding: 30px; background: #f8fafc; }
          .convite-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .convite-actions { text-align: center; margin: 30px 0; }
          .btn-aceitar { background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 0 10px; }
          .btn-recusar { background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 0 10px; }
          .convite-info { color: #6b7280; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="convite-container">
          <div class="convite-header">
            <h1>Convite para ${tipoFormatado}</h1>
          </div>
          
          <div class="convite-body">
            <p>Olá${convidado.nome ? `, ${convidado.nome}` : ''},</p>
            
            <p>Você foi convidado(a) para participar do seguinte agendamento:</p>
            
            <div class="convite-details">
              <h3>${agendamento.titulo}</h3>
              ${agendamento.descricao ? `<p><strong>Descrição:</strong> ${agendamento.descricao}</p>` : ''}
              <p><strong>Data e Hora:</strong> ${dataFormatada} às ${horaFormatada}</p>
              ${agendamento.local ? `<p><strong>Local:</strong> ${agendamento.local}</p>` : ''}
              ${agendamento.observacoes ? `<p><strong>Observações:</strong> ${agendamento.observacoes}</p>` : ''}
            </div>
            
            <div class="convite-actions">
              <a href="${linkResposta}&resposta=aceito" class="btn-aceitar">✓ Aceitar</a>
              <a href="${linkResposta}&resposta=recusado" class="btn-recusar">✗ Recusar</a>
            </div>
            
            <div class="convite-info">
              <p><small>Por favor, responda até ${this.formatDate(this.addHours(agendamento.data_convite, 24))} às ${this.formatTime(this.addHours(agendamento.data_convite, 24))}.</small></p>
              <p><small>Se você não responder, sua participação será considerada como aceita automaticamente.</small></p>
            </div>
          </div>
          
          ${this.getEmailFooter()}
        </div>
      </body>
      </html>
    `;

    const text = `
CONVITE PARA ${tipoFormatado.toUpperCase()}

Olá${convidado.nome ? `, ${convidado.nome}` : ''},

Você foi convidado(a) para participar do seguinte agendamento:

${agendamento.titulo}
${agendamento.descricao ? `Descrição: ${agendamento.descricao}` : ''}
Data e Hora: ${dataFormatada} às ${horaFormatada}
${agendamento.local ? `Local: ${agendamento.local}` : ''}
${agendamento.observacoes ? `Observações: ${agendamento.observacoes}` : ''}

Para responder ao convite, acesse: ${linkResposta}

Por favor, responda até ${this.formatDate(this.addHours(agendamento.data_convite, 24))}.
Se você não responder, sua participação será considerada como aceita automaticamente.
    `;

    return { subject, html, text };
  }

  /**
   * Gera template de lembrete
   * @param {Object} agendamento - Dados do agendamento
   * @param {Object} convidado - Dados do convidado
   * @param {string} tipoLembrete - Tipo do lembrete ('24h', '1h', 'final')
   * @returns {Object} { subject, html, text }
   */
  static generateLembreteTemplate(agendamento, convidado, tipoLembrete = '24h') {
    const dataFormatada = this.formatDate(agendamento.data_hora);
    const horaFormatada = this.formatTime(agendamento.data_hora);
    const tipoFormatado = this.formatTipo(agendamento.tipo);
    
    const lembreteTextos = {
      '24h': 'Lembrete: Agendamento em 24 horas',
      '1h': 'Lembrete: Agendamento em 1 hora',
      'final': 'Lembrete Final: Agendamento hoje'
    };

    const subject = `${lembreteTextos[tipoLembrete]} - ${agendamento.titulo}`;
    
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lembrete de Agendamento</title>
        <style>
          ${this.getBaseStyles()}
          .lembrete-container { max-width: 600px; margin: 0 auto; }
          .lembrete-header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .lembrete-body { padding: 30px; background: #f8fafc; }
          .lembrete-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .status-aceito { background: #d1fae5; color: #065f46; }
          .status-pendente { background: #fef3c7; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="lembrete-container">
          <div class="lembrete-header">
            <h1>🔔 ${lembreteTextos[tipoLembrete]}</h1>
          </div>
          
          <div class="lembrete-body">
            <p>Olá${convidado.nome ? `, ${convidado.nome}` : ''},</p>
            
            <p>Este é um lembrete sobre o ${tipoFormatado} do qual você participa:</p>
            
            <div class="lembrete-details">
              <h3>${agendamento.titulo}</h3>
              <p><strong>Data e Hora:</strong> ${dataFormatada} às ${horaFormatada}</p>
              ${agendamento.local ? `<p><strong>Local:</strong> ${agendamento.local}</p>` : ''}
              ${agendamento.observacoes ? `<p><strong>Observações:</strong> ${agendamento.observacoes}</p>` : ''}
              
              <p><strong>Sua confirmação:</strong> 
                <span class="status-badge ${convidado.status === CONVIDADO_STATUS.ACEITO ? 'status-aceito' : 'status-pendente'}">
                  ${convidado.status === CONVIDADO_STATUS.ACEITO ? '✓ Confirmado' : '⏳ Pendente'}
                </span>
              </p>
            </div>
            
            ${this.getPreparationTips(tipoLembrete)}
          </div>
          
          ${this.getEmailFooter()}
        </div>
      </body>
      </html>
    `;

    const text = `
${lembreteTextos[tipoLembrete].toUpperCase()}

Olá${convidado.nome ? `, ${convidado.nome}` : ''},

Este é um lembrete sobre o ${tipoFormatado} do qual você participa:

${agendamento.titulo}
Data e Hora: ${dataFormatada} às ${horaFormatada}
${agendamento.local ? `Local: ${agendamento.local}` : ''}
${agendamento.observacoes ? `Observações: ${agendamento.observacoes}` : ''}

Sua confirmação: ${convidado.status === CONVIDADO_STATUS.ACEITO ? 'Confirmado' : 'Pendente'}
    `;

    return { subject, html, text };
  }

  /**
   * Gera template de confirmação de resposta
   * @param {Object} agendamento - Dados do agendamento
   * @param {Object} convidado - Dados do convidado
   * @param {string} resposta - 'aceito' ou 'recusado'
   * @returns {Object} { subject, html, text }
   */
  static generateConfirmacaoTemplate(agendamento, convidado, resposta) {
    const dataFormatada = this.formatDate(agendamento.data_hora);
    const horaFormatada = this.formatTime(agendamento.data_hora);
    const tipoFormatado = this.formatTipo(agendamento.tipo);
    
    const isAceito = resposta === 'aceito';
    const subject = `Confirmação: ${isAceito ? 'Participação confirmada' : 'Participação recusada'} - ${agendamento.titulo}`;
    
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmação de Resposta</title>
        <style>
          ${this.getBaseStyles()}
          .confirmacao-container { max-width: 600px; margin: 0 auto; }
          .confirmacao-header { background: ${isAceito ? '#10b981' : '#ef4444'}; color: white; padding: 20px; text-align: center; }
          .confirmacao-body { padding: 30px; background: #f8fafc; }
          .confirmacao-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="confirmacao-container">
          <div class="confirmacao-header">
            <h1>${isAceito ? '✓' : '✗'} ${isAceito ? 'Participação Confirmada' : 'Participação Recusada'}</h1>
          </div>
          
          <div class="confirmacao-body">
            <p>Olá${convidado.nome ? `, ${convidado.nome}` : ''},</p>
            
            <p>Sua resposta foi registrada com sucesso!</p>
            
            <div class="confirmacao-details">
              <h3>${agendamento.titulo}</h3>
              <p><strong>Data e Hora:</strong> ${dataFormatada} às ${horaFormatada}</p>
              ${agendamento.local ? `<p><strong>Local:</strong> ${agendamento.local}</p>` : ''}
              <p><strong>Sua resposta:</strong> ${isAceito ? '✓ Confirmada' : '✗ Recusada'}</p>
              ${convidado.justificativa ? `<p><strong>Justificativa:</strong> ${convidado.justificativa}</p>` : ''}
            </div>
            
            ${isAceito ? 
              '<p>Obrigado por confirmar sua participação! Esperamos você no agendamento.</p>' :
              '<p>Obrigado por nos informar. Sua resposta foi registrada.</p>'
            }
          </div>
          
          ${this.getEmailFooter()}
        </div>
      </body>
      </html>
    `;

    const text = `
${(isAceito ? 'PARTICIPAÇÃO CONFIRMADA' : 'PARTICIPAÇÃO RECUSADA')}

Olá${convidado.nome ? `, ${convidado.nome}` : ''},

Sua resposta foi registrada com sucesso!

${agendamento.titulo}
Data e Hora: ${dataFormatada} às ${horaFormatada}
${agendamento.local ? `Local: ${agendamento.local}` : ''}
Sua resposta: ${isAceito ? 'Confirmada' : 'Recusada'}
${convidado.justificativa ? `Justificativa: ${convidado.justificativa}` : ''}

${isAceito ? 
  'Obrigado por confirmar sua participação! Esperamos você no agendamento.' :
  'Obrigado por nos informar. Sua resposta foi registrada.'
}
    `;

    return { subject, html, text };
  }

  /**
   * Gera template de notificação para organizador
   * @param {Object} agendamento - Dados do agendamento
   * @param {Object} organizador - Dados do organizador
   * @param {string} tipoNotificacao - Tipo da notificação
   * @param {Object} dadosAdicionais - Dados específicos da notificação
   * @returns {Object} { subject, html, text }
   */
  static generateNotificacaoOrganizadorTemplate(agendamento, organizador, tipoNotificacao, dadosAdicionais = {}) {
    const dataFormatada = this.formatDate(agendamento.data_hora);
    const convidados = ConvidadoUtilsService.parseConvidados(agendamento.convidados);
    const stats = ConvidadoUtilsService.analyzeConvidadosStatus(convidados);
    
    const templates = {
      'resposta_recebida': {
        subject: `Nova resposta: ${agendamento.titulo}`,
        content: `O convidado ${dadosAdicionais.convidado?.nome || dadosAdicionais.convidado?.email} ${dadosAdicionais.resposta === 'aceito' ? 'aceitou' : 'recusou'} o convite.`
      },
      'todas_respostas_recebidas': {
        subject: `Todas as respostas recebidas: ${agendamento.titulo}`,
        content: `Todos os convidados responderam ao agendamento. Resumo: ${stats.aceitos} aceitos, ${stats.recusados} recusados.`
      },
      'convites_expirados': {
        subject: `Convites expirados: ${agendamento.titulo}`,
        content: `Os convites para este agendamento expiraram. Convidados pendentes foram considerados como aceitos automaticamente.`
      },
      'lembrete_agendamento': {
        subject: `Lembrete: Agendamento hoje - ${agendamento.titulo}`,
        content: `Lembrete de que o agendamento está programado para hoje às ${this.formatTime(agendamento.data_hora)}.`
      }
    };

    const template = templates[tipoNotificacao] || {
      subject: `Notificação: ${agendamento.titulo}`,
      content: 'Notificação sobre o agendamento.'
    };

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notificação do Organizador</title>
        <style>
          ${this.getBaseStyles()}
          .notificacao-container { max-width: 600px; margin: 0 auto; }
          .notificacao-header { background: #6366f1; color: white; padding: 20px; text-align: center; }
          .notificacao-body { padding: 30px; background: #f8fafc; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
          .stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; }
          .stat-number { font-size: 24px; font-weight: bold; color: #6366f1; }
          .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="notificacao-container">
          <div class="notificacao-header">
            <h1>📋 Notificação do Organizador</h1>
          </div>
          
          <div class="notificacao-body">
            <p>Olá${organizador.nome ? `, ${organizador.nome}` : ''},</p>
            
            <p>${template.content}</p>
            
            <div class="agendamento-details">
              <h3>${agendamento.titulo}</h3>
              <p><strong>Data:</strong> ${dataFormatada}</p>
              <p><strong>Status:</strong> ${this.formatStatus(agendamento.status)}</p>
            </div>
            
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">${stats.total}</div>
                <div class="stat-label">Total Convidados</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${stats.aceitos}</div>
                <div class="stat-label">Aceitos</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${stats.pendentes}</div>
                <div class="stat-label">Pendentes</div>
              </div>
            </div>
          </div>
          
          ${this.getEmailFooter()}
        </div>
      </body>
      </html>
    `;

    const text = `
NOTIFICAÇÃO DO ORGANIZADOR

Olá${organizador.nome ? `, ${organizador.nome}` : ''},

${template.content}

${agendamento.titulo}
Data: ${dataFormatada}
Status: ${this.formatStatus(agendamento.status)}

Resumo dos Convidados:
- Total: ${stats.total}
- Aceitos: ${stats.aceitos}
- Recusados: ${stats.recusados}
- Pendentes: ${stats.pendentes}
    `;

    return { subject: template.subject, html, text };
  }

  /**
   * Gera template de cancelamento
   * @param {Object} agendamento - Dados do agendamento
   * @param {Object} destinatario - Dados do destinatário
   * @param {string} motivoCancelamento - Motivo do cancelamento
   * @returns {Object} { subject, html, text }
   */
  static generateCancelamentoTemplate(agendamento, destinatario, motivoCancelamento) {
    const dataFormatada = this.formatDate(agendamento.data_hora);
    const horaFormatada = this.formatTime(agendamento.data_hora);
    const tipoFormatado = this.formatTipo(agendamento.tipo);
    
    const subject = `Cancelamento: ${agendamento.titulo}`;
    
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Agendamento Cancelado</title>
        <style>
          ${this.getBaseStyles()}
          .cancelamento-container { max-width: 600px; margin: 0 auto; }
          .cancelamento-header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .cancelamento-body { padding: 30px; background: #f8fafc; }
          .cancelamento-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
          .motivo-box { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="cancelamento-container">
          <div class="cancelamento-header">
            <h1>🚫 Agendamento Cancelado</h1>
          </div>
          
          <div class="cancelamento-body">
            <p>Olá${destinatario.nome ? `, ${destinatario.nome}` : ''},</p>
            
            <p>Informamos que o seguinte ${tipoFormatado} foi <strong>cancelado</strong>:</p>
            
            <div class="cancelamento-details">
              <h3>${agendamento.titulo}</h3>
              <p><strong>Data e Hora:</strong> ${dataFormatada} às ${horaFormatada}</p>
              ${agendamento.local ? `<p><strong>Local:</strong> ${agendamento.local}</p>` : ''}
            </div>
            
            ${motivoCancelamento ? `
              <div class="motivo-box">
                <strong>Motivo do cancelamento:</strong><br>
                ${motivoCancelamento}
              </div>
            ` : ''}
            
            <p>Pedimos desculpas por qualquer inconveniente causado.</p>
          </div>
          
          ${this.getEmailFooter()}
        </div>
      </body>
      </html>
    `;

    const text = `
AGENDAMENTO CANCELADO

Olá${destinatario.nome ? `, ${destinatario.nome}` : ''},

Informamos que o seguinte ${tipoFormatado} foi CANCELADO:

${agendamento.titulo}
Data e Hora: ${dataFormatada} às ${horaFormatada}
${agendamento.local ? `Local: ${agendamento.local}` : ''}

${motivoCancelamento ? `Motivo do cancelamento: ${motivoCancelamento}` : ''}

Pedimos desculpas por qualquer inconveniente causado.
    `;

    return { subject, html, text };
  }

  // ===================
  // MÉTODOS AUXILIARES
  // ===================

  /**
   * Formata data para exibição
   * @param {Date|string} data 
   * @returns {string} Data formatada
   */
  static formatDate(data) {
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formata hora para exibição
   * @param {Date|string} data 
   * @returns {string} Hora formatada
   */
  static formatTime(data) {
    const date = new Date(data);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formata tipo do agendamento
   * @param {string} tipo 
   * @returns {string} Tipo formatado
   */
  static formatTipo(tipo) {
    const tipos = {
      [AGENDAMENTO_TIPOS.REUNIAO]: 'reunião',
      [AGENDAMENTO_TIPOS.AUDIENCIA]: 'audiência',
      [AGENDAMENTO_TIPOS.PRAZO]: 'prazo',
      [AGENDAMENTO_TIPOS.OUTRO]: 'agendamento'
    };
    return tipos[tipo] || 'agendamento';
  }

  /**
   * Formata status do agendamento
   * @param {string} status 
   * @returns {string} Status formatado
   */
  static formatStatus(status) {
    const statusMap = {
      [AGENDAMENTO_STATUS.EM_ANALISE]: 'Em Análise',
      [AGENDAMENTO_STATUS.ENVIANDO_CONVITES]: 'Enviando Convites',
      [AGENDAMENTO_STATUS.PENDENTE]: 'Pendente',
      [AGENDAMENTO_STATUS.MARCADO]: 'Marcado',
      [AGENDAMENTO_STATUS.CANCELADO]: 'Cancelado',
      [AGENDAMENTO_STATUS.FINALIZADO]: 'Finalizado'
    };
    return statusMap[status] || status;
  }

  /**
   * Adiciona horas a uma data
   * @param {Date|string} data 
   * @param {number} horas 
   * @returns {Date} Nova data
   */
  static addHours(data, horas) {
    const result = new Date(data);
    result.setHours(result.getHours() + horas);
    return result;
  }

  /**
   * Retorna CSS base para emails
   * @returns {string} CSS styles
   */
  static getBaseStyles() {
    return `
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f3f4f6; }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
      h1, h2, h3 { margin: 0 0 15px 0; }
      p { margin: 0 0 15px 0; }
      .text-center { text-align: center; }
      .bg-primary { background-color: #2563eb; }
      .text-white { color: white; }
      .p-4 { padding: 20px; }
      .mb-4 { margin-bottom: 20px; }
    `;
  }

  /**
   * Retorna dicas de preparação baseadas no tipo de lembrete
   * @param {string} tipoLembrete 
   * @returns {string} HTML com dicas
   */
  static getPreparationTips(tipoLembrete) {
    const tips = {
      '24h': `
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4>💡 Dicas de Preparação:</h4>
          <ul style="padding-left: 20px;">
            <li>Revise os materiais necessários</li>
            <li>Confirme o local e meio de acesso</li>
            <li>Prepare suas perguntas ou pontos de discussão</li>
          </ul>
        </div>
      `,
      '1h': `
        <div style="background: #fffbeb; border: 1px solid #fed7aa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4>⏰ Últimos preparativos:</h4>
          <ul style="padding-left: 20px;">
            <li>Teste sua conexão de internet (se online)</li>
            <li>Separe os documentos necessários</li>
            <li>Confirme o trajeto para o local</li>
          </ul>
        </div>
      `,
      'final': `
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4>🎯 Checklist Final:</h4>
          <ul style="padding-left: 20px;">
            <li>Materiais organizados</li>
            <li>Chegada com antecedência</li>
            <li>Dispositivos carregados</li>
          </ul>
        </div>
      `
    };
    return tips[tipoLembrete] || '';
  }

  /**
   * Retorna rodapé padrão dos emails
   * @returns {string} HTML do rodapé
   */
  static getEmailFooter() {
    return `
      <div style="background: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          Este é um email automático do Sistema NPJ. Por favor, não responda diretamente a este email.
        </p>
        <p style="color: #6b7280; font-size: 12px; margin: 5px 0 0 0;">
          © ${new Date().getFullYear()} Sistema NPJ - Núcleo de Prática Jurídica
        </p>
      </div>
    `;
  }
}

module.exports = AgendamentoEmailTemplateService;