// Serviço de Email Simplificado

const nodemailer = require('nodemailer');

// Configuração simplificada
let transporter = null;

// Inicializar transporter se configurações existirem
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

// Função helper para simular envio se não há config
async function simularEnvio(para, assunto) {
  console.log(`📧 [SIMULADO] Email enviado para: ${para} | Assunto: ${assunto}`);
  return { success: true, message: 'Email simulado enviado com sucesso' };
}

// Função genérica para enviar email
async function enviarEmail(para, assunto, html) {
  try {
    if (!transporter) {
      return await simularEnvio(para, assunto);
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@npj.com',
      to: para,
      subject: assunto,
      html: html
    });

    console.log(`📧 Email enviado: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error: error.message };
  }
}

// Templates simplificados
const templates = {
  recuperacaoSenha: (token) => `
    <h2>Recuperação de Senha</h2>
    <p>Clique no link abaixo para redefinir sua senha:</p>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}">
      Redefinir Senha
    </a>
    <p>Este link expira em 1 hora.</p>
  `,
  
  bemVindo: (nome) => `
    <h2>Bem-vindo ao Sistema NPJ!</h2>
    <p>Olá ${nome},</p>
    <p>Sua conta foi criada com sucesso. Você já pode fazer login no sistema.</p>
  `,
  
  processoCriado: (numeroProcesso) => `
    <h2>Novo Processo Criado</h2>
    <p>O processo <strong>${numeroProcesso}</strong> foi criado com sucesso.</p>
  `,
  
  agendamentoCriado: (titulo, data) => `
    <h2>Novo Agendamento</h2>
    <p>Agendamento "<strong>${titulo}</strong>" marcado para ${data}.</p>
  `
};

// Funções específicas de email
async function enviarEmailRecuperacao(email, token) {
  const html = templates.recuperacaoSenha(token);
  return await enviarEmail(email, 'Recuperação de Senha - Sistema NPJ', html);
}

async function enviarEmailBemVindo(email, nome) {
  const html = templates.bemVindo(nome);
  return await enviarEmail(email, 'Bem-vindo ao Sistema NPJ', html);
}

async function enviarEmailProcessoCriado(email, numeroProcesso) {
  const html = templates.processoCriado(numeroProcesso);
  return await enviarEmail(email, 'Novo Processo Criado', html);
}

async function enviarEmailAgendamentoCriado(email, titulo, data) {
  const html = templates.agendamentoCriado(titulo, data);
  return await enviarEmail(email, 'Novo Agendamento Criado', html);
}

// Funções de agendamento
async function enviarEmailAgendamentoConfirmado(email, titulo) {
  const html = `<h2>Agendamento Confirmado</h2><p>Seu agendamento "${titulo}" foi confirmado.</p>`;
  return await enviarEmail(email, 'Agendamento Confirmado', html);
}

async function enviarEmailAgendamentoCancelado(email, titulo) {
  const html = `<h2>Agendamento Cancelado</h2><p>Seu agendamento "${titulo}" foi cancelado.</p>`;
  return await enviarEmail(email, 'Agendamento Cancelado', html);
}

// Funções de segurança
async function enviarEmailLoginSuspeito(email) {
  const html = `<h2>Login Suspeito Detectado</h2><p>Detectamos um login suspeito em sua conta. Se não foi você, altere sua senha imediatamente.</p>`;
  return await enviarEmail(email, 'Login Suspeito Detectado', html);
}

async function enviarEmailContaBloqueada(email) {
  const html = `<h2>Conta Bloqueada</h2><p>Sua conta foi bloqueada por motivos de segurança. Entre em contato com o suporte.</p>`;
  return await enviarEmail(email, 'Conta Bloqueada', html);
}

async function enviarEmailProcessoAtualizado(email, numeroProcesso) {
  const html = `<h2>Processo Atualizado</h2><p>O processo ${numeroProcesso} foi atualizado.</p>`;
  return await enviarEmail(email, 'Processo Atualizado', html);
}

module.exports = {
  enviarEmail,
  enviarEmailRecuperacao,
  enviarEmailBemVindo,
  enviarEmailProcessoCriado,
  enviarEmailAgendamentoCriado,
  enviarEmailAgendamentoConfirmado,
  enviarEmailAgendamentoCancelado,
  enviarEmailLoginSuspeito,
  enviarEmailContaBloqueada,
  enviarEmailProcessoAtualizado,
  simularEnvio
};
