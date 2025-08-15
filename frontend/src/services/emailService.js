const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // Use TLS, não SSL
  auth: {
    user: '94cc0d001@smtp-brevo.com', // Seu login SMTP
    pass: 'm93QYkcgJDyK7ISL', // Sua senha mestre SMTP
  },
});

async function enviarEmailLembrete({ email_cliente, titulo, data_agendamento, descricao }) {
  const dataFormatada = new Date(data_agendamento).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const mailOptions = {
    from: '"NPJ - Lembrete" <94cc0d001@smtp-brevo.com>',
    to: email_cliente,
    subject: `Lembrete de Agendamento - ${titulo}`,
    html: `
      <h1>Não se esqueça do nosso compromisso!</h1>
      <p>Este é um lembrete para o seu agendamento:</p>
      <ul>
        <li><strong>Título:</strong> ${titulo}</li>
        <li><strong>Data e Hora:</strong> ${dataFormatada}</li>
        <li><strong>Descrição:</strong> ${descricao}</li>
      </ul>
      <p>Atenciosamente,<br>Equipe NPJ</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`E-mail enviado para ${email_cliente}`);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }
}

module.exports = { enviarEmailLembrete };