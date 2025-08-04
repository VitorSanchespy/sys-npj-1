/**
 * Validador de Variáveis de Ambiente
 * Centraliza a validação e configuração de todas as variáveis de ambiente
 */

require('dotenv').config();

// Variáveis obrigatórias para o funcionamento básico
const REQUIRED_ENV_VARS = [
  'PORT',
  'NODE_ENV',
  'DB_HOST',
  'DB_PORT', 
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

// Variáveis opcionais com valores padrão (para funcionalidades extras)
const OPTIONAL_ENV_VARS = {
  'BCRYPT_ROUNDS': '12',
  'TOKEN_EXPIRATION': '24h',
  'REFRESH_TOKEN_EXPIRATION': '7d',
  'CORS_ORIGIN': 'http://localhost:5173',
  'CORS_CREDENTIALS': 'true',
  'RATE_LIMIT_WINDOW_MS': '900000',
  'RATE_LIMIT_MAX_REQUESTS': '100',
  'MAX_FILE_SIZE': '10485760',
  'UPLOAD_PATH': './uploads',
  'UPLOAD_DIR': 'uploads'
};

// Variáveis de email (opcionais, mas se uma for definida, todas devem estar)
const EMAIL_ENV_VARS = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER', 
  'SMTP_PASS',
  'EMAIL_FROM',
  'FRONTEND_URL'
];

function validateEnvironment() {
  const missingRequired = [];
  const warnings = [];

  // Verificar variáveis obrigatórias
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missingRequired.push(envVar);
    }
  }

  if (missingRequired.length > 0) {
    throw new Error(`❌ Variáveis de ambiente obrigatórias não definidas: ${missingRequired.join(', ')}\n` +
                   `💡 Verifique se o arquivo .env está configurado corretamente.`);
  }

  // Verificar configuração de email (se pelo menos uma variável de email estiver definida)
  const emailVarsConfigured = EMAIL_ENV_VARS.filter(envVar => process.env[envVar]);
  if (emailVarsConfigured.length > 0 && emailVarsConfigured.length < EMAIL_ENV_VARS.length) {
    const missingEmailVars = EMAIL_ENV_VARS.filter(envVar => !process.env[envVar]);
    warnings.push(`⚠️  Configuração de email incompleta. Faltam: ${missingEmailVars.join(', ')}`);
  }

  // Definir valores padrão para variáveis opcionais
  for (const [envVar, defaultValue] of Object.entries(OPTIONAL_ENV_VARS)) {
    if (!process.env[envVar]) {
      process.env[envVar] = defaultValue;
      warnings.push(`ℹ️  Usando valor padrão para ${envVar}: ${defaultValue}`);
    }
  }

  // Validar tipos de dados
  try {
    parseInt(process.env.PORT);
    parseInt(process.env.DB_PORT);
    parseInt(process.env.BCRYPT_ROUNDS);
  } catch (error) {
    throw new Error(`❌ Erro na conversão de tipos das variáveis de ambiente: ${error.message}`);
  }

  // Exibir warnings se houver
  if (warnings.length > 0) {
    console.log('\n📋 Configurações de ambiente:');
    warnings.forEach(warning => console.log(warning));
    console.log('');
  }

  console.log('✅ Variáveis de ambiente validadas com sucesso!');
  return true;
}

function getConfig() {
  return {
    // Server
    PORT: parseInt(process.env.PORT),
    NODE_ENV: process.env.NODE_ENV,
    
    // Database
    DB_HOST: process.env.DB_HOST,
    DB_PORT: parseInt(process.env.DB_PORT),
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    
    // Security
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS),
    TOKEN_EXPIRATION: process.env.TOKEN_EXPIRATION,
    REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION,
    
    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',
    
    // Upload
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE),
    UPLOAD_PATH: process.env.UPLOAD_PATH,
    UPLOAD_DIR: process.env.UPLOAD_DIR,
    
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS),
    
    // Email (podem ser undefined se não configurados)
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    EMAIL_FROM: process.env.EMAIL_FROM,
    FRONTEND_URL: process.env.FRONTEND_URL,
    
    // Email availability
    isEmailConfigured: () => {
      return !!(process.env.SMTP_HOST && process.env.SMTP_PORT && 
               process.env.SMTP_USER && process.env.SMTP_PASS && 
               process.env.EMAIL_FROM);
    }
  };
}

module.exports = {
  validateEnvironment,
  getConfig
};
