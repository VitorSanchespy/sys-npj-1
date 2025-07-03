const dotenvConfig = require('dotenv').config();
const mysql = require('mysql2');
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectTimeout: 10000,
  waitForConnections: true,
});


if (dotenvConfig.error) {
  console.error('Erro ao carregar .env:', dotenvConfig.error);
  // Pode continuar apenas se tiver fallback
}

// tratamento de erro
db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', {
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      message: err.message
    });
    process.exit(1); // Encerra o aplicativo se não conectar
  }
  console.log(`MySQL conectado em ${process.env.DB_HOST} como ${process.env.DB_USER}`);
});

// Lidar com erros
db.on('error', (err) => {
  console.error('Erro na conexão MySQL:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    // Reconectar se a conexão for perdida
    db.connect();
  } else {
    throw err;
  }
});
module.exports = db;