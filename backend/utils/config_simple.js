// Configuração Simplificada do Sistema

require('dotenv').config();

const config = {
  // Configurações do servidor
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development',
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        process.env.FRONTEND_URL
      ].filter(Boolean),
      credentials: true
    }
  },

  // Configurações do banco de dados
  database: {
    development: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'npj_db',
      dialect: 'mysql',
      logging: false
    },
    production: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      dialect: 'mysql',
      logging: false
    }
  },

  // Configurações JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'seuSegredoSuperSecreto4321',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  // Configurações de email
  email: {
    enabled: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    from: process.env.EMAIL_FROM || 'noreply@npj.com'
  },

  // Configurações de upload
  upload: {
    maxSize: process.env.UPLOAD_MAX_SIZE || 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'text/plain'
    ],
    path: process.env.UPLOAD_PATH || './uploads'
  },

  // URLs
  urls: {
    frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
    api: process.env.API_URL || 'http://localhost:3001'
  }
};

// Função para obter configuração do ambiente atual
const getDbConfig = () => {
  const env = config.server.env;
  return config.database[env] || config.database.development;
};

module.exports = {
  ...config,
  getDbConfig
};
