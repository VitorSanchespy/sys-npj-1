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
  enviarEmailAgendamentoCancelado,
  enviarEmailLoginSuspeito,
  enviarEmailContaBloqueada,
  enviarEmailBemVindo,
  enviarEmailProcessoCriado,
  enviarEmailProcessoAtualizado
};

// === EMAILS DE AUTENTICAÇÃO ===

// Enviar email de tentativa de login suspeita
async function enviarEmailLoginSuspeito(emailDestinatario, detalhes) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@npj.ufmt.br',
      to: emailDestinatario,
      subject: '🔐 Tentativa de Login Detectada - Sistema NPJ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">🔐 Tentativa de Login Detectada</h2>
          
          <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p><strong>Uma tentativa de login foi detectada em sua conta:</strong></p>
            
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0;"><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</li>
              <li style="margin: 10px 0;"><strong>IP:</strong> ${detalhes.ip || 'N/A'}</li>
              <li style="margin: 10px 0;"><strong>Navegador:</strong> ${detalhes.userAgent || 'N/A'}</li>
            </ul>
            
            <p style="color: #92400e; font-size: 14px;">
              Se esta tentativa não foi feita por você, recomendamos alterar sua senha imediatamente.
            </p>
          </div>
          
          <div style="margin: 20px 0; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
               style="background-color: #1f2937; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Acessar Sistema
            </a>
          </div>
        </div>
      `
    });

    console.log('✅ Email de login suspeito enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email de login suspeito:', error);
    return false;
  }
}

// Enviar email de conta bloqueada
async function enviarEmailContaBloqueada(emailDestinatario, detalhes) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@npj.ufmt.br',
      to: emailDestinatario,
      subject: '🚫 Conta Temporariamente Bloqueada - Sistema NPJ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">🚫 Conta Temporariamente Bloqueada</h2>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p><strong>Sua conta foi temporariamente bloqueada devido a múltiplas tentativas de login incorretas.</strong></p>
            
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0;"><strong>Tentativas:</strong> ${detalhes.tentativas || 'N/A'}</li>
              <li style="margin: 10px 0;"><strong>Último IP:</strong> ${detalhes.ip || 'N/A'}</li>
              <li style="margin: 10px 0;"><strong>Desbloqueio:</strong> Em 1 hora</li>
            </ul>
            
            <p style="color: #991b1b; font-size: 14px;">
              Por segurança, você pode tentar fazer login novamente após 1 hora.
            </p>
          </div>
        </div>
      `
    });

    console.log('✅ Email de conta bloqueada enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email de conta bloqueada:', error);
    return false;
  }
}

// === EMAILS DE USUÁRIOS ===

// Enviar email de boas-vindas
async function enviarEmailBemVindo(emailDestinatario, usuario) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@npj.ufmt.br',
      to: emailDestinatario,
      subject: '🎉 Bem-vindo ao Sistema NPJ - UFMT',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">🎉 Bem-vindo ao Sistema NPJ</h2>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <p><strong>Olá, ${usuario.nome}!</strong></p>
            
            <p>Sua conta foi criada com sucesso no Sistema de Núcleo de Prática Jurídica da UFMT.</p>
            
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0;"><strong>Nome:</strong> ${usuario.nome}</li>
              <li style="margin: 10px 0;"><strong>Email:</strong> ${usuario.email}</li>
              <li style="margin: 10px 0;"><strong>Data de Criação:</strong> ${new Date().toLocaleString('pt-BR')}</li>
            </ul>
            
            <p>Agora você pode acessar o sistema e começar a utilizar todas as funcionalidades.</p>
          </div>
          
          <div style="margin: 20px 0; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
               style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Fazer Login
            </a>
          </div>
        </div>
      `
    });

    console.log('✅ Email de boas-vindas enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email de boas-vindas:', error);
    return false;
  }
}

// === EMAILS DE PROCESSOS ===

// Enviar email de processo criado
async function enviarEmailProcessoCriado(emailDestinatario, processo, criador) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@npj.ufmt.br',
      to: emailDestinatario,
      subject: `📋 Novo Processo Criado: ${processo.numero_processo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">📋 Novo Processo Criado</h2>
          
          <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <p><strong>${criador.nome} criou um novo processo que pode ser do seu interesse.</strong></p>
            
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0;"><strong>Número:</strong> ${processo.numero_processo}</li>
              <li style="margin: 10px 0;"><strong>Assunto:</strong> ${processo.assunto || 'N/A'}</li>
              <li style="margin: 10px 0;"><strong>Criado por:</strong> ${criador.nome}</li>
              <li style="margin: 10px 0;"><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</li>
            </ul>
          </div>
          
          <div style="margin: 20px 0; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/processos/${processo.id}" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Ver Processo
            </a>
          </div>
        </div>
      `
    });

    console.log('✅ Email de processo criado enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email de processo criado:', error);
    return false;
  }
}

// Enviar email de processo atualizado
async function enviarEmailProcessoAtualizado(emailDestinatario, processo, atualizadoPor) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@npj.ufmt.br',
      to: emailDestinatario,
      subject: `📝 Processo Atualizado: ${processo.numero_processo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">📝 Processo Atualizado</h2>
          
          <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p><strong>${atualizadoPor.nome} atualizou informações do processo.</strong></p>
            
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0;"><strong>Número:</strong> ${processo.numero_processo}</li>
              <li style="margin: 10px 0;"><strong>Assunto:</strong> ${processo.assunto || 'N/A'}</li>
              <li style="margin: 10px 0;"><strong>Atualizado por:</strong> ${atualizadoPor.nome}</li>
              <li style="margin: 10px 0;"><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</li>
            </ul>
          </div>
          
          <div style="margin: 20px 0; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/processos/${processo.id}" 
               style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Ver Atualizações
            </a>
          </div>
        </div>
      `
    });

    console.log('✅ Email de processo atualizado enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email de processo atualizado:', error);
    return false;
  }
}