// Configuração Sequelize Simplificada

const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

try {
  // Tentar criar conexão com banco
  sequelize = new Sequelize(
    process.env.DB_NAME || 'npj_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        timestamps: true,
        underscored: false
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      retry: {
        match: [
          /ETIMEDOUT/,
          /EHOSTUNREACH/,
          /ECONNRESET/,
          /ECONNREFUSED/,
          /ETIMEDOUT/,
          /ESOCKETTIMEDOUT/,
          /EHOSTUNREACH/,
          /EPIPE/,
          /EAI_AGAIN/,
          /SequelizeConnectionError/,
          /SequelizeConnectionRefusedError/,
          /SequelizeHostNotFoundError/,
          /SequelizeHostNotReachableError/,
          /SequelizeInvalidConnectionError/,
          /SequelizeConnectionTimedOutError/
        ],
        max: 3
      }
    }
  );

  // Testar conexão
  sequelize.authenticate()
    .then(() => {
      console.log('✅ Conexão com banco de dados estabelecida com sucesso.');
      global.dbAvailable = true;
    })
    .catch((error) => {
      console.log('⚠️ Erro ao conectar com banco de dados:', error.message);
      console.log('🔄 Sistema funcionará em modo mock');
      global.dbAvailable = false;
    });

} catch (error) {
  console.log('⚠️ Erro na configuração do banco:', error.message);
  console.log('🔄 Sistema funcionará em modo mock');
  global.dbAvailable = false;
  
  // Criar um sequelize mock para evitar erros
  sequelize = {
    authenticate: () => Promise.reject(new Error('Banco não configurado')),
    sync: () => Promise.resolve(),
    close: () => Promise.resolve()
  };
}

module.exports = sequelize;
