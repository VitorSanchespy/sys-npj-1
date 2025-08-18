const nodemailer = require('nodemailer');
const axios = require('axios');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../env/main.env') });


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Configuração da API Brevo
const brevoConfig = {
  apiKey: process.env.BREVO_API_KEY,
  apiUrl: process.env.BREVO_API_URL || 'https://api.brevo.com/v3',
  fromEmail: process.env.EMAIL_FROM || 'noreply@npj.ufmt.br',
  fromName: 'NPJ - Sistema de Agendamentos'
};

// Função para enviar email via API Brevo
async function enviarViaBrevoAPI(emailData) {
  try {
    const response = await axios.post(`${brevoConfig.apiUrl}/smtp/email`, {
                sender: {
        name: brevoConfig.fromName,
        email: brevoConfig.fromEmail
      },
      to: emailData.to,
      subject: emailData.subject,
      htmlContent: emailData.html,
      textContent: emailData.text || emailData.html.replace(/<[^>]*>/g, '')
    }, {
      headers: {
        'api-key': brevoConfig.apiKey,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Email enviado via Brevo API (ID: ${response.data.messageId})`);
    return { success: true, messageId: response.data.messageId, provider: 'brevo-api' };
  } catch (error) {
    console.error('❌ Erro ao enviar via Brevo API:', error.response?.data || error.message);
    throw error;
  }
}

// Função para enviar notificação de aprovação de agendamento para responsáveis
async function enviarNotificacaoAprovacaoAgendamento(agendamento) {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0066cc;">📅 Nova Solicitação de Agendamento</h2>
        <p><strong>Título:</strong> ${agendamento.titulo}</p>
        <p><strong>Descrição:</strong> ${agendamento.descricao || 'Não informado'}</p>
        <p><strong>Data/Hora:</strong> ${new Date(agendamento.data_inicio).toLocaleString('pt-BR')} - ${new Date(agendamento.data_fim).toLocaleString('pt-BR')}</p>
        <p><strong>Local:</strong> ${agendamento.local || 'Não informado'}</p>
        <p><strong>Solicitante:</strong> ${agendamento.usuario?.nome} (${agendamento.usuario?.email})</p>
        ${agendamento.processo ? `<p><strong>Processo:</strong> ${agendamento.processo.numero_processo} - ${agendamento.processo.titulo}</p>` : ''}
        
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #0066cc;">
          <p><strong>Ação Necessária:</strong> Este agendamento precisa ser aprovado ou recusado por um responsável (Admin/Professor).</p>
        </div>
        
        <p>Acesse o sistema para tomar uma decisão sobre esta solicitação.</p>
      </div>
    `;
    
    // Buscar Admin e Professores para notificar
    const { usuarioModel: Usuario } = require('../models/indexModel');
    const responsaveis = await Usuario.findAll({
      where: {
        role_name: ['Admin', 'Professor']
      }
    });
    
    for (const responsavel of responsaveis) {
      await enviarEmail({
        to: [{ email: responsavel.email, name: responsavel.nome }],
        subject: `Nova Solicitação de Agendamento - ${agendamento.titulo}`,
        html
      });
    }
    
    console.log('✅ Notificação de aprovação enviada para responsáveis');
  } catch (error) {
    console.error('❌ Erro ao enviar notificação de aprovação:', error);
  }
}

// Função para enviar notificação de recusa de agendamento
async function enviarNotificacaoRecusaAgendamento(agendamento, motivoRecusa) {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #dc3545;">❌ Agendamento Recusado</h2>
        <p><strong>Título:</strong> ${agendamento.titulo}</p>
        <p><strong>Data/Hora:</strong> ${new Date(agendamento.data_inicio).toLocaleString('pt-BR')} - ${new Date(agendamento.data_fim).toLocaleString('pt-BR')}</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #f8d7da; border-left: 4px solid #dc3545;">
          <h3 style="color: #721c24; margin-top: 0;">Motivo da Recusa:</h3>
          <p style="margin-bottom: 0;">${motivoRecusa}</p>
        </div>
        
        <p>Você pode criar uma nova solicitação de agendamento considerando as observações acima.</p>
      </div>
    `;
    
    await enviarEmail({
      to: [{ email: agendamento.usuario.email, name: agendamento.usuario.nome }],
      subject: `Agendamento Recusado - ${agendamento.titulo}`,
      html
    });
    
    console.log('✅ Notificação de recusa enviada para solicitante');
  } catch (error) {
    console.error('❌ Erro ao enviar notificação de recusa:', error);
  }
}

// Função para enviar email via SMTP (fallback)
async function enviarViaSMTP(emailData) {
  try {
    const info = await transporter.sendMail({
      from: `"${brevoConfig.fromName}" <${brevoConfig.fromEmail}>`,
      to: emailData.to.map(r => r.email).join(', '),
      subject: emailData.subject,
      html: emailData.html
    });
    console.log(`✅ Email enviado via SMTP (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId, provider: 'smtp' };
  } catch (error) {
    console.error('❌ Erro ao enviar via SMTP:', error.message);
    throw error;
  }
}

// Função principal para enviar email (tenta API primeiro, fallback para SMTP)
async function enviarEmail(emailData) {
  // Modo desenvolvimento: simular envio
    // Removido modo simulado: sempre tentar envio real
  

  // Sempre usar SMTP, ignorando API Brevo
  try {
    return await enviarViaSMTP(emailData);
  } catch (error) {
    throw error;
  }
}

// Função para enviar convite de agendamento
async function enviarConviteAgendamento(agendamento, emailConvidado, nomeConvidado) {
  try {
    const dataFormatada = new Date(agendamento.data_inicio).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (!emailConvidado) {
      throw new Error('Email do convidado não informado');
    }

    // URLs para aceitar/recusar convite
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const urlAceitar = `${baseUrl}/convite/${agendamento.id}/aceitar?email=${encodeURIComponent(emailConvidado)}`;
    const urlRecusar = `${baseUrl}/convite/${agendamento.id}/recusar?email=${encodeURIComponent(emailConvidado)}`;

    const emailData = {
      to: [{ email: emailConvidado, name: nomeConvidado || 'Convidado' }],
      subject: `Convite para Agendamento - ${agendamento.titulo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📧 Convite para Agendamento</h1>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Olá <strong>${nomeConvidado || 'Convidado'}</strong>,</p>
            <p style="font-size: 16px; margin-bottom: 30px;">Você foi convidado para o seguinte agendamento:</p>
            
            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #007bff;">
              <div style="display: grid; gap: 15px;">
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 10px;">📅</span>
                  <span><strong>Título:</strong> ${agendamento.titulo}</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 10px;">⏰</span>
                  <span><strong>Data e Hora:</strong> ${dataFormatada}</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 10px;">📍</span>
                  <span><strong>Local:</strong> ${agendamento.local || 'Não informado'}</span>
                </div>
                ${agendamento.descricao ? `
                <div style="display: flex; align-items: flex-start;">
                  <span style="font-size: 20px; margin-right: 10px;">📝</span>
                  <span><strong>Descrição:</strong> ${agendamento.descricao}</span>
                </div>
                ` : ''}
              </div>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <p style="font-size: 16px; margin-bottom: 25px; color: #555;">
                <strong>Por favor, confirme sua participação:</strong>
              </p>
              
              <div style="display: inline-block; margin: 0 10px;">
                <a href="${urlAceitar}" 
                   style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; margin: 0 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: background-color 0.3s;">
                  ✅ Aceitar Convite
                </a>
              </div>
              
              <div style="display: inline-block; margin: 0 10px;">
                <a href="${urlRecusar}" 
                   style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; margin: 0 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: background-color 0.3s;">
                  ❌ Recusar Convite
                </a>
              </div>
            </div>

            <div style="background-color: #e9ecef; padding: 20px; border-radius: 8px; margin-top: 30px;">
              <p style="margin: 0; font-size: 14px; color: #666; text-align: center;">
                <strong>Importante:</strong> Este convite é válido até a data do agendamento. 
                Caso não consiga abrir os links, copie e cole a URL no seu navegador.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #666;">
                Atenciosamente,<br>
                <strong style="color: #007bff;">Equipe NPJ</strong>
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await enviarEmail(emailData);
    console.log(`✅ Convite enviado para ${emailConvidado} via ${result.provider}`);
    return result;
  } catch (error) {
    console.error('❌ Erro ao enviar convite:', error);
    throw error;
  }
}

// Função para enviar lembrete de agendamento
async function enviarLembreteAgendamento(agendamento, emailParticipante, nomeParticipante) {
  try {
    const dataFormatada = new Date(agendamento.data_inicio).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const tempoRestante = Math.round((new Date(agendamento.data_inicio) - new Date()) / (1000 * 60 * 60));

    if (!emailParticipante) {
      throw new Error('Email do participante não informado');
    }
    const emailData = {
      to: [{ email: emailParticipante, name: nomeParticipante || 'Participante' }],
      subject: `🔔 Lembrete: ${agendamento.titulo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e74c3c;">🔔 Lembrete de Agendamento</h1>
          <p>Olá <strong>${nomeParticipante || 'Participante'}</strong>,</p>
          <p>Este é um lembrete sobre seu próximo agendamento:</p>
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0;"><strong>📅 Título:</strong> ${agendamento.titulo}</li>
              <li style="margin: 10px 0;"><strong>⏰ Data e Hora:</strong> ${dataFormatada}</li>
              <li style="margin: 10px 0;"><strong>📍 Local:</strong> ${agendamento.local || 'Não informado'}</li>
              <li style="margin: 10px 0;"><strong>📝 Descrição:</strong> ${agendamento.descricao || 'Não informada'}</li>
              ${tempoRestante > 0 ? `<li style="margin: 10px 0;"><strong>⏳ Tempo restante:</strong> Aproximadamente ${tempoRestante} hora(s)</li>` : ''}
            </ul>
          </div>
          <p style="color: #e74c3c;"><strong>⚠️ Não se esqueça!</strong></p>
          <p>Atenciosamente,<br><strong>Equipe NPJ</strong></p>
        </div>
      `
    };

    const result = await enviarEmail(emailData);
    console.log(`✅ Lembrete enviado para ${emailParticipante} via ${result.provider}`);
    return result;
  } catch (error) {
    console.error('❌ Erro ao enviar lembrete:', error);
    throw error;
  }
}

// ...código correto acima...

module.exports = {
  enviarConviteAgendamento,
  enviarLembreteAgendamento,
  enviarNotificacaoAprovacaoAgendamento,
  enviarNotificacaoRecusaAgendamento
};