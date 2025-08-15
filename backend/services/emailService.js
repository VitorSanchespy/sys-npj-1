const nodemailer = require('nodemailer');

// Configuração do transporter real (SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: false, // true para 465, false para outras portas
  auth: {
    user: process.env.SMTP_USER || 'seuemail@gmail.com',
    pass: process.env.SMTP_PASS || 'suasenha'
  }
});

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

    const mailOptions = {
      from: '"NPJ - Convite" <noreply@npj.com>',
      to: emailConvidado,
      subject: `Convite para Agendamento - ${agendamento.titulo}`,
      html: `
        <h1>Você foi convidado para um agendamento!</h1>
        <p>Olá ${nomeConvidado || 'Convidado'},</p>
        <p>Você foi convidado para o seguinte agendamento:</p>
        <ul>
          <li><strong>Título:</strong> ${agendamento.titulo}</li>
          <li><strong>Data e Hora:</strong> ${dataFormatada}</li>
          <li><strong>Local:</strong> ${agendamento.local || 'Não informado'}</li>
          <li><strong>Descrição:</strong> ${agendamento.descricao || 'Não informada'}</li>
        </ul>
        <p>Atenciosamente,<br>Equipe NPJ</p>
      `,
    };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ Convite enviado para ${emailConvidado} (ID: ${info.messageId})`);
  return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erro ao enviar convite:', error);
    throw error;
  }
}

// Função para enviar lembrete de agendamento
async function enviarLembreteAgendamento(agendamento) {
  try {
    const dataFormatada = new Date(agendamento.data_inicio).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Enviar para o email de lembrete se especificado
    if (agendamento.email_lembrete) {
      const mailOptions = {
        from: '"NPJ - Lembrete" <noreply@npj.com>',
        to: agendamento.email_lembrete,
        subject: `Lembrete de Agendamento - ${agendamento.titulo}`,
        html: `
          <h1>Não se esqueça do nosso compromisso!</h1>
          <p>Este é um lembrete para o seu agendamento:</p>
          <ul>
            <li><strong>Título:</strong> ${agendamento.titulo}</li>
            <li><strong>Data e Hora:</strong> ${dataFormatada}</li>
            <li><strong>Local:</strong> ${agendamento.local || 'Não informado'}</li>
            <li><strong>Descrição:</strong> ${agendamento.descricao || 'Não informada'}</li>
          </ul>
          <p>Atenciosamente,<br>Equipe NPJ</p>
        `,
      };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ Lembrete enviado para ${agendamento.email_lembrete} (ID: ${info.messageId})`);
    }

    // Enviar para convidados aceitos
    if (agendamento.convidados && Array.isArray(agendamento.convidados)) {
      for (const convidado of agendamento.convidados) {
        if (convidado.status === 'aceito' && convidado.email) {
          const mailOptions = {
            from: '"NPJ - Lembrete" <noreply@npj.com>',
            to: convidado.email,
            subject: `Lembrete de Agendamento - ${agendamento.titulo}`,
            html: `
              <h1>Não se esqueça do nosso compromisso!</h1>
              <p>Olá ${convidado.nome || 'Convidado'},</p>
              <p>Este é um lembrete para o agendamento que você confirmou presença:</p>
              <ul>
                <li><strong>Título:</strong> ${agendamento.titulo}</li>
                <li><strong>Data e Hora:</strong> ${dataFormatada}</li>
                <li><strong>Local:</strong> ${agendamento.local || 'Não informado'}</li>
                <li><strong>Descrição:</strong> ${agendamento.descricao || 'Não informada'}</li>
              </ul>
              <p>Atenciosamente,<br>Equipe NPJ</p>
            `,
          };

          const info = await transporter.sendMail(mailOptions);
          console.log(`✅ Lembrete enviado para ${convidado.email} (ID: ${info.messageId})`);
        }
      }
    }

    console.log(`✅ Lembrete enviado para agendamento: ${agendamento.titulo}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao enviar lembrete:', error);
    throw error;
  }
}

module.exports = {
  enviarConviteAgendamento,
  enviarLembreteAgendamento
};