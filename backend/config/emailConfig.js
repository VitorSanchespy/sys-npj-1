// Configuração para controle de envio de emails
// Usado principalmente para desabilitar emails em ambiente de testes

const emailConfig = {
  // Controla se emails devem ser enviados
  // false = não envia emails (útil para testes)
  // true = envia emails normalmente
  emailsHabilitados: process.env.ENABLE_EMAILS !== 'false',
  
  // Log de emails mesmo quando desabilitados
  logEmailsDesabilitados: process.env.LOG_DISABLED_EMAILS === 'true',
  
  // Ambiente atual
  ambiente: process.env.NODE_ENV || 'development',
  
  // Verificar se está em ambiente de produção
  isProducao: () => {
    return process.env.NODE_ENV === 'production';
  },
  
  // Verificar se emails estão habilitados
  podeEnviarEmail: () => {
    // Se explicitamente desabilitado, não enviar
    if (process.env.ENABLE_EMAILS === 'false') {
      return false;
    }
    
    // Se em ambiente de teste da universidade, verificar configuração
    if (process.env.UNIVERSITY_TEST_MODE === 'true') {
      return process.env.ENABLE_EMAILS_IN_TEST === 'true';
    }
    
    return emailConfig.emailsHabilitados;
  },
  
  // Log quando email seria enviado mas está desabilitado
  logEmailDesabilitado: (tipo, destinatario, assunto) => {
    if (emailConfig.logEmailsDesabilitados) {
      console.log(`📧 [EMAIL DESABILITADO] Tipo: ${tipo} | Para: ${destinatario} | Assunto: ${assunto}`);
    }
  }
};

module.exports = emailConfig;
