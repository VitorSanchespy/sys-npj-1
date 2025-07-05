require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const slowDown = require('express-slow-down');
const fs = require('fs');
const path = require('path');
const app = express();

// Configuração básica de segurança
app.use(helmet());
app.use(express.json());
app.use(
  mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      console.warn(`[Sanitize] Campo suspeito em ${req.path}: ${key}`);
    }
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
const corsOptions = {
  origin: [
    'http://localhost:0000', // Seu front-end
    'https://seusite.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Se usar cookies
};
app.use(cors(corsOptions));
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.example.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'cdn.example.com']
      }
    },
    hsts: {
      maxAge: 63072000, // 2 anos em segundos
      includeSubDomains: true,
      preload: true
    }
  })
);

// Header adicional contra XSS
app.use((req, res, next) => {
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message:'Muitas requisições - tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);


const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs:(used, req) => {
    const delayAfter = req.slowDown.limit; // Pega o valor de delayAfter
    return (used - delayAfter) * 500; // Aumenta 500ms por requisição excedente
  }
});
app.use(speedLimiter);

// Conexão com o banco de dados
require('./config/db');

// Cria a pasta 'uploads' se não existir
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}



// Rotas
app.use('/auth', require('./routes/authRoutes'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/processos', require('./routes/processoRoutes'));
app.use('/api/arquivos', require('./routes/arquivoRoutes'));
// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});