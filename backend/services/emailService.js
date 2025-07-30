const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function enviarEmailRecuperacao(email, token) {
  const resetLink = `http://seusite.com/reset-password?token=${token}`;
  
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Redefinição de Senha',
    html: `
      <p>Você solicitou a redefinição de senha. Clique no link abaixo:</p>
      <a href="${resetLink}">Redefinir Senha</a>
      <p>Se você não solicitou isso, ignore este email.</p>
    `
  });

  console.log('Email enviado:', info.messageId);
}

// Enviar email de notificação de agendamento criado
async function enviarEmailAgendamentoCriado(emailDestinatario, agendamento, criador) {
  try {
    const dataFormatada = new Date(agendamento.data_evento).toLocaleString('pt-BR');
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@npj.ufmt.br',
      to: emailDestinatario,
      subject: `Novo Agendamento: ${agendamento.titulo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">📅 Novo Agendamento Criado</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">${agendamento.titulo}</h3>
            <p><strong>Tipo:</strong> ${agendamento.tipo_evento}</p>
            <p><strong>Data/Hora:</strong> ${dataFormatada}</p>
            ${agendamento.local ? `<p><strong>Local:</strong> ${agendamento.local}</p>` : ''}
            ${agendamento.descricao ? `<p><strong>Descrição:</strong> ${agendamento.descricao}</p>` : ''}
            <p><strong>Criado por:</strong> ${criador.nome}</p>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">
            Este agendamento foi criado no Sistema NPJ. Para mais detalhes, acesse o sistema.
          </p>
        </div>
      `
    });

    console.log('✅ Email de agendamento enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email de agendamento:', error);
    return false;
  }
}

// Enviar email de confirmação de agendamento
async function enviarEmailAgendamentoConfirmado(emailDestinatario, agendamento) {
  try {
    const dataFormatada = new Date(agendamento.data_evento).toLocaleString('pt-BR');
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@npj.ufmt.br',
      to: emailDestinatario,
      subject: `Agendamento Confirmado: ${agendamento.titulo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">✅ Agendamento Confirmado</h2>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h3 style="color: #1e293b; margin-top: 0;">${agendamento.titulo}</h3>
            <p><strong>Data/Hora:</strong> ${dataFormatada}</p>
            ${agendamento.local ? `<p><strong>Local:</strong> ${agendamento.local}</p>` : ''}
          </div>
          
          <p>Seu agendamento foi confirmado e está sendo processado. Você receberá lembretes conforme configurado.</p>
        </div>
      `
    });

    console.log('✅ Email de confirmação enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email de confirmação:', error);
    return false;
  }
}

// Enviar email de cancelamento de agendamento
async function enviarEmailAgendamentoCancelado(emailDestinatario, agendamento, motivo = '') {
  try {
    const dataFormatada = new Date(agendamento.data_evento).toLocaleString('pt-BR');
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@npj.ufmt.br',
      to: emailDestinatario,
      subject: `Agendamento Cancelado: ${agendamento.titulo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">❌ Agendamento Cancelado</h2>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="color: #1e293b; margin-top: 0;">${agendamento.titulo}</h3>
            <p><strong>Data/Hora:</strong> ${dataFormatada}</p>
            ${agendamento.local ? `<p><strong>Local:</strong> ${agendamento.local}</p>` : ''}
            ${motivo ? `<p><strong>Motivo:</strong> ${motivo}</p>` : ''}
          </div>
          
          <p>Este agendamento foi cancelado. Se necessário, entre em contato para reagendar.</p>
        </div>
      `
    });

    console.log('✅ Email de cancelamento enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email de cancelamento:', error);
    return false;
  }
}

module.exports = { 
  enviarEmailRecuperacao,
  enviarEmailAgendamentoCriado,
  enviarEmailAgendamentoConfirmado,
  enviarEmailAgendamentoCancelado
};